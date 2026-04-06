"""
NodeBB SSO + 发帖代理
用户登录 FastAPI 后，发帖请求经过 FastAPI 转发到 NodeBB
FastAPI 验证用户身份，用 admin token + _uid 代替用户发帖
"""
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from app.api.deps import get_current_user, get_db
from app.models import User

router = APIRouter(prefix="/nodebb", tags=["nodebb"])

NODEBB_URL       = "http://localhost:4567"
NODEBB_API_TOKEN = "1162f5f5-b22a-4bec-a012-774557719dbe"
NODEBB_HEADERS   = {
    "Authorization": f"Bearer {NODEBB_API_TOKEN}",
    "Content-Type":  "application/json",
}

def make_password(email: str) -> str:
    import hashlib
    return "Sso_" + hashlib.md5(f"guyongzhe_{email}".encode()).hexdigest()[:16]


async def get_or_create_nodebb_user(email: str, username: str) -> dict | None:
    async with httpx.AsyncClient() as client:
        safe_username = (
            username.replace("@", "_").replace(".", "_")
            .replace(" ", "_")[:20]
        )

        # 先按用户名查找（_uid=1 必须带上）
        res = await client.get(
            f"{NODEBB_URL}/api/v3/users",
            params={"query": safe_username, "searchBy": "username", "_uid": 1},
            headers=NODEBB_HEADERS,
        )
        if res.status_code == 200:
            users = res.json().get("response", {}).get("users", [])
            if users:
                return users[0]

        # 再按 email 查找
        res = await client.get(
            f"{NODEBB_URL}/api/v3/users",
            params={"query": email, "searchBy": "email", "_uid": 1},
            headers=NODEBB_HEADERS,
        )
        if res.status_code == 200:
            users = res.json().get("response", {}).get("users", [])
            if users:
                return users[0]

        # 不存在则创建（_uid=1 放在 body 里）
        res = await client.post(
            f"{NODEBB_URL}/api/v3/users",
            json={
                "username": safe_username,
                "email":    email,
                "password": make_password(email),
                "_uid":     1,
            },
            headers=NODEBB_HEADERS,
        )
        if res.status_code in (200, 201):
            return res.json().get("response")
        return None


@router.post("/sso")
async def nodebb_sso(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    email    = current_user.email
    username = email.split("@")[0]
    nbb_user = await get_or_create_nodebb_user(email, username)
    if not nbb_user:
        raise HTTPException(status_code=500, detail="NodeBB 用户创建失败")
    return {
        "success":         True,
        "nodebb_uid":      nbb_user.get("uid"),
        "nodebb_username": nbb_user.get("username"),
        "user_password":   make_password(email),
    }


# ── 发帖代理 ──────────────────────────────────────────────────────────────────

class TopicCreate(BaseModel):
    cid:     int
    title:   str
    content: str
    tags:    list[str] = []

class ReplyCreate(BaseModel):
    content: str


@router.post("/topics")
async def create_topic(
    body:         TopicCreate,
    current_user: User = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """代理发帖：FastAPI 验证用户，用 admin token + _uid 发到 NodeBB"""
    email    = current_user.email
    username = email.split("@")[0]

    nbb_user = await get_or_create_nodebb_user(email, username)
    if not nbb_user:
        raise HTTPException(status_code=500, detail="NodeBB 用户不存在")

    nbb_uid = nbb_user.get("uid")

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{NODEBB_URL}/api/v3/topics",
            json={
                "cid":     body.cid,
                "title":   body.title,
                "content": body.content,
                "tags":    body.tags,
                "_uid":    nbb_uid,
            },
            headers=NODEBB_HEADERS,
        )
        if not res.is_success:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return res.json().get("response")


@router.post("/topics/{tid}/reply")
async def reply_topic(
    tid:          int,
    body:         ReplyCreate,
    current_user: User = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """代理回复"""
    email    = current_user.email
    username = email.split("@")[0]
    nbb_user = await get_or_create_nodebb_user(email, username)
    if not nbb_user:
        raise HTTPException(status_code=500, detail="NodeBB 用户不存在")

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{NODEBB_URL}/api/v3/topics/{tid}",
            json={"content": body.content, "_uid": nbb_user.get("uid")},
            headers=NODEBB_HEADERS,
        )
        if not res.is_success:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return res.json().get("response")


@router.get("/me")
async def nodebb_me(current_user: User = Depends(get_current_user)):
    email = current_user.email
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{NODEBB_URL}/api/v3/users",
            params={"query": email, "searchBy": "email", "_uid": 1},
            headers=NODEBB_HEADERS,
        )
        if res.status_code == 200:
            users = res.json().get("response", {}).get("users", [])
            if users:
                return {"found": True, "user": users[0]}
    return {"found": False}