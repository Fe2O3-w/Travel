"""
旅行日志 API 路由
"""
from datetime import datetime
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.deps import get_current_user, get_db
from app.models import User

router = APIRouter(prefix="/travel-logs", tags=["travel-logs"])


# ── 动态导入（避免循环引用）───────────────────────────────────────────────────
def get_travel_log_model():
    from app.models import TravelLog
    return TravelLog


# ── Schemas ───────────────────────────────────────────────────────────────────

class TravelLogCreate(BaseModel):
    city_name  : str
    province   : str
    title      : str
    content    : str
    mood       : str = "happy"
    rating     : int = 5
    visited_at : Optional[str] = None   # ISO 格式日期字符串，为空则用当前时间


class TravelLogOut(BaseModel):
    id         : int
    city_name  : str
    province   : str
    title      : str
    content    : str
    mood       : str
    rating     : int
    visited_at : datetime
    created_at : datetime


class TravelLogUpdate(BaseModel):
    title      : Optional[str] = None
    content    : Optional[str] = None
    mood       : Optional[str] = None
    rating     : Optional[int] = None
    visited_at : Optional[str] = None


# ── 端点 ──────────────────────────────────────────────────────────────────────

@router.post("", response_model=TravelLogOut)
def create_log(
    body : TravelLogCreate,
    db   : Session = Depends(get_db),
    user : User    = Depends(get_current_user),
):
    """创建旅行日志"""
    TravelLog = get_travel_log_model()
    visited_at = datetime.utcnow()
    if body.visited_at:
        try:
            visited_at = datetime.fromisoformat(body.visited_at.replace("Z", "+00:00"))
        except ValueError:
            pass

    log = TravelLog(
        user_id    = user.id,
        city_name  = body.city_name,
        province   = body.province,
        title      = body.title,
        content    = body.content,
        mood       = body.mood,
        rating     = max(1, min(5, body.rating)),
        visited_at = visited_at,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("", response_model=list[TravelLogOut])
def get_my_logs(
    city_name : Optional[str] = None,
    db        : Session       = Depends(get_db),
    user      : User          = Depends(get_current_user),
):
    """获取当前用户的所有旅行日志（可按城市过滤）"""
    TravelLog = get_travel_log_model()
    query = select(TravelLog).where(TravelLog.user_id == user.id)
    if city_name:
        query = query.where(TravelLog.city_name == city_name)
    query = query.order_by(TravelLog.visited_at.desc())
    return db.exec(query).all()


@router.get("/{log_id}", response_model=TravelLogOut)
def get_log(
    log_id : int,
    db     : Session = Depends(get_db),
    user   : User    = Depends(get_current_user),
):
    """获取单条日志"""
    TravelLog = get_travel_log_model()
    log = db.get(TravelLog, log_id)
    if not log or log.user_id != user.id:
        raise HTTPException(status_code=404, detail="日志不存在")
    return log


@router.patch("/{log_id}", response_model=TravelLogOut)
def update_log(
    log_id : int,
    body   : TravelLogUpdate,
    db     : Session = Depends(get_db),
    user   : User    = Depends(get_current_user),
):
    """更新日志"""
    TravelLog = get_travel_log_model()
    log = db.get(TravelLog, log_id)
    if not log or log.user_id != user.id:
        raise HTTPException(status_code=404, detail="日志不存在")
    if body.title      is not None: log.title   = body.title
    if body.content    is not None: log.content = body.content
    if body.mood       is not None: log.mood    = body.mood
    if body.rating     is not None: log.rating  = max(1, min(5, body.rating))
    if body.visited_at is not None:
        try:
            log.visited_at = datetime.fromisoformat(body.visited_at.replace("Z", "+00:00"))
        except ValueError:
            pass
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.delete("/{log_id}")
def delete_log(
    log_id : int,
    db     : Session = Depends(get_db),
    user   : User    = Depends(get_current_user),
):
    """删除日志"""
    TravelLog = get_travel_log_model()
    log = db.get(TravelLog, log_id)
    if not log or log.user_id != user.id:
        raise HTTPException(status_code=404, detail="日志不存在")
    db.delete(log)
    db.commit()
    return {"ok": True}