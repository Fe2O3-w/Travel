"""
AchievementService — 成就触发与解锁逻辑
每次用户打卡城市后调用 check_and_unlock()
"""
import json
from sqlmodel import Session, select
from app.models import Achievement, UserAchievement, CityVisit


class AchievementService:
    def __init__(self, session: Session):
        self.session = session

    def get_visited_cities(self, user_id: int) -> list[str]:
        stmt = select(CityVisit.city_name).where(CityVisit.user_id == user_id).distinct()
        return list(self.session.exec(stmt).all())

    def get_unlocked_codes(self, user_id: int) -> set[str]:
        stmt = (
            select(Achievement.code)
            .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
            .where(UserAchievement.user_id == user_id)
        )
        return set(self.session.exec(stmt).all())

    def _evaluate(self, condition: dict, user_id: int, visited: list[str]) -> bool:
        t = condition.get("type")

        if t == "city_count":
            return len(visited) >= condition["threshold"]

        if t == "region_combo":
            required = set(condition["cities"])
            return required.issubset(set(visited))

        if t == "post_count":
            # 社区模块待实现，暂时返回 False
            return False

        if t == "pet_interact":
            # 桌宠互动日志待实现，暂时返回 False
            return False

        return False

    def check_and_unlock(self, user_id: int) -> list[Achievement]:
        """
        检查并解锁满足条件的成就，返回本次新解锁的成就列表。
        在每次城市打卡、发帖、桌宠互动后调用。
        """
        visited         = self.get_visited_cities(user_id)
        unlocked        = self.get_unlocked_codes(user_id)
        all_achvs       = self.session.exec(select(Achievement)).all()
        newly_unlocked: list[Achievement] = []

        for achv in all_achvs:
            if achv.code in unlocked:
                continue
            try:
                condition = json.loads(achv.condition_json)
            except json.JSONDecodeError:
                continue

            if self._evaluate(condition, user_id, visited):
                ua = UserAchievement(user_id=user_id, achievement_id=achv.id)
                self.session.add(ua)
                newly_unlocked.append(achv)

        self.session.commit()
        return newly_unlocked