"""
OAuth2 Provider 端点
供 NodeBB SSO 插件调用，实现单点登录
流程：
  1. NodeBB 把用户重定向到 /oauth/authorize
  2. 用户在主站登录后，重定向回 NodeBB 并带上 code
  3. NodeBB 用 code 换 token（/oauth/token）
  4. NodeBB 用 token 获取用户信息（/oauth/userinfo）
"""
import secrets
import time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from sqlmodel import Session, select

from app.api.deps import get_db
from app.core.security import verify_password, create_access_token
from app.models import User

router = APIRouter(prefix="/oauth", tags=["oauth2"])

# 内存存储 code 和 token（生产环境用 Redis）
_auth_codes:  dict[str, dict] = {}
_tokens:      dict[str, dict] = {}

CLIENT_ID     = "guyongzhe-client"
CLIENT_SECRET = "guyongzhe-secret-2024"
NODEBB_CALLBACK = "http://localhost:4567/auth/guyongzhe/callback"


# ── 1. 授权端点 ────────────────────────────────────────────────────────────────
@router.get("/authorize", response_class=HTMLResponse)
async def oauth_authorize(
    client_id:     str,
    redirect_uri:  str,
    response_type: str = "code",
    state:         str = "",
):
    """显示登录表单，用户登录后生成 code 重定向回 NodeBB"""
    if client_id != CLIENT_ID:
        raise HTTPException(status_code=400, detail="Invalid client_id")

    html = f"""
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>蛄蛹者 · 账号登录</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .card {{
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 360px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }}
    .logo {{
      text-align: center;
      margin-bottom: 24px;
    }}
    .logo h1 {{ font-size: 24px; color: #1a1a2e; }}
    .logo p  {{ font-size: 13px; color: #888; margin-top: 4px; }}
    label {{ display: block; font-size: 13px; color: #555; margin-bottom: 6px; }}
    input {{
      width: 100%; padding: 10px 14px;
      border: 1.5px solid #e5e7eb;
      border-radius: 10px; font-size: 14px;
      margin-bottom: 16px; outline: none;
      transition: border-color .2s;
    }}
    input:focus {{ border-color: #7c3aed; }}
    button {{
      width: 100%; padding: 12px;
      background: #7c3aed; color: white;
      border: none; border-radius: 10px;
      font-size: 15px; font-weight: 500;
      cursor: pointer; transition: opacity .2s;
    }}
    button:hover {{ opacity: 0.9; }}
    .error {{
      background: #fef2f2; color: #dc2626;
      padding: 10px 14px; border-radius: 8px;
      font-size: 13px; margin-bottom: 16px;
      display: none;
    }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <h1>🐛 蛄蛹者</h1>
      <p>云游中国 · 用主站账号登录社区</p>
    </div>
    <div class="error" id="err"></div>
    <form method="POST" action="/oauth/authorize">
      <input type="hidden" name="redirect_uri" value="{redirect_uri}">
      <input type="hidden" name="state" value="{state}">
      <label>邮箱</label>
      <input type="email" name="email" placeholder="输入你的邮箱" required autofocus>
      <label>密码</label>
      <input type="password" name="password" placeholder="输入密码" required>
      <button type="submit">登录并授权</button>
    </form>
  </div>
</body>
</html>
"""
    return HTMLResponse(html)


@router.post("/authorize")
async def oauth_authorize_post(
    request:      Request,
    redirect_uri: str = Form(...),
    state:        str = Form(""),
    email:        str = Form(...),
    password:     str = Form(...),
    db:           Session = Depends(get_db),
):
    """处理登录表单，验证用户后生成 code"""
    # 验证用户
    user = db.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        html = f"""
        <script>
          document.getElementById('err').style.display='block';
          document.getElementById('err').textContent='邮箱或密码错误';
        </script>
        """
        # 重新显示登录页，带错误提示
        return RedirectResponse(
            url=f"/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={redirect_uri}&state={state}&error=invalid_credentials",
            status_code=302,
        )

    # 生成 authorization code
    code = secrets.token_urlsafe(32)
    _auth_codes[code] = {
        "user_id":  str(user.id),
        "email":    user.email,
        "username": user.email.split("@")[0],
        "expires":  time.time() + 300,  # 5 分钟有效
    }

    # 重定向回 NodeBB
    sep = "&" if "?" in redirect_uri else "?"
    return RedirectResponse(
        url=f"{redirect_uri}{sep}code={code}&state={state}",
        status_code=302,
    )


# ── 2. Token 端点 ──────────────────────────────────────────────────────────────
@router.post("/token")
async def oauth_token(
    grant_type:    str = Form(...),
    code:          str = Form(...),
    redirect_uri:  str = Form(""),
    client_id:     str = Form(...),
    client_secret: str = Form(...),
):
    """用 code 换 access token"""
    if client_id != CLIENT_ID or client_secret != CLIENT_SECRET:
        raise HTTPException(status_code=401, detail="Invalid client credentials")

    code_data = _auth_codes.get(code)
    if not code_data:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    if time.time() > code_data["expires"]:
        del _auth_codes[code]
        raise HTTPException(status_code=400, detail="Code expired")

    # 生成 access token
    access_token = secrets.token_urlsafe(32)
    _tokens[access_token] = {
        **code_data,
        "expires": time.time() + 3600,
    }
    del _auth_codes[code]

    return JSONResponse({
        "access_token": access_token,
        "token_type":   "Bearer",
        "expires_in":   3600,
    })


# ── 3. 用户信息端点 ────────────────────────────────────────────────────────────
@router.get("/userinfo")
async def oauth_userinfo(request: Request):
    """返回用户信息给 NodeBB"""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth[7:]
    token_data = _tokens.get(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    if time.time() > token_data["expires"]:
        del _tokens[token]
        raise HTTPException(status_code=401, detail="Token expired")

    return {
        "id":       token_data["user_id"],
        "email":    token_data["email"],
        "username": token_data["username"],
        "picture":  f"https://api.dicebear.com/7.x/adventurer/svg?seed={token_data['email']}",
    }