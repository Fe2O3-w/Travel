"""
成就系统 API 路由
挂载到主 app: app.include_router(achievement_router, prefix="/api/v1")
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models import Achievement, UserAchievement, CityVisit
from app.services.achievement_service import AchievementService
from app.api.deps import get_current_user, get_db  # 模板自带
from app.models import User
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/achievements", tags=["achievements"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CityCheckinRequest(BaseModel):
    city_name : str
    province  : str
    source    : str = "manual"

class AchievementOut(BaseModel):
    id          : int
    code        : str
    name        : str
    description : str
    category    : str
    rarity      : str
    icon_url    : str | None
    unlocked_at : datetime | None = None

class CheckinResponse(BaseModel):
    visited_cities    : list[str]
    newly_unlocked    : list[AchievementOut]
    total_city_count  : int


# ── 端点 ──────────────────────────────────────────────────────────────────────

@router.post("/checkin", response_model=CheckinResponse)
def checkin_city(
    req    : CityCheckinRequest,
    db     : Session      = Depends(get_db),
    user   : User         = Depends(get_current_user),
):
    """用户打卡城市，自动触发成就检查"""
    # 幂等：同一用户同一城市不重复记录
    existing = db.exec(
        select(CityVisit)
        .where(CityVisit.user_id == user.id)
        .where(CityVisit.city_name == req.city_name)
    ).first()

    if not existing:
        visit = CityVisit(
            user_id   = user.id,
            city_name = req.city_name,
            province  = req.province,
            source    = req.source,
        )
        db.add(visit)
        db.commit()

    svc = AchievementService(db)
    newly_unlocked = svc.check_and_unlock(user.id)
    visited        = svc.get_visited_cities(user.id)

    return CheckinResponse(
        visited_cities   = visited,
        newly_unlocked   = [
            AchievementOut(
                id=a.id, code=a.code, name=a.name,
                description=a.description, category=a.category,
                rarity=a.rarity, icon_url=a.icon_url,
            )
            for a in newly_unlocked
        ],
        total_city_count = len(visited),
    )


@router.get("/me", response_model=list[AchievementOut])
def get_my_achievements(
    db   : Session = Depends(get_db),
    user : User    = Depends(get_current_user),
):
    """获取当前用户已解锁的所有成就"""
    rows = db.exec(
        select(Achievement, UserAchievement)
        .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
        .where(UserAchievement.user_id == user.id)
    ).all()

    return [
        AchievementOut(
            id=a.id, code=a.code, name=a.name,
            description=a.description, category=a.category,
            rarity=a.rarity, icon_url=a.icon_url,
            unlocked_at=ua.unlocked_at,
        )
        for a, ua in rows
    ]


@router.get("/all", response_model=list[AchievementOut])
def get_all_achievements(db: Session = Depends(get_db)):
    """获取全部成就定义（用于图鉴展示，含未解锁）"""
    return db.exec(select(Achievement)).all()


@router.get("/visited-cities")
def get_visited_cities(
    db   : Session = Depends(get_db),
    user : User    = Depends(get_current_user),
):
    """返回用户已打卡城市列表（供地图高亮用）"""
    svc = AchievementService(db)
    return {"cities": svc.get_visited_cities(user.id)}