"""
成就种子数据脚本
运行方式：在 backend 目录下执行
  python seed_achievements.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from sqlmodel import Session, select
from app.core.db import engine
from app.models import Achievement

ACHIEVEMENTS = [
    # ── 探索类 explorer ────────────────────────────────────────────────
    dict(code="first_step",      name="第一步",        description="完成第一次城市打卡",           category="explorer", rarity="common",    condition_json='{"city_count":1}',   reward_mood=5,  reward_energy=5),
    dict(code="explorer_5",      name="初级探险家",     description="解锁 5 座城市",               category="explorer", rarity="common",    condition_json='{"city_count":5}',   reward_mood=10, reward_energy=10),
    dict(code="explorer_10",     name="旅行新手",       description="解锁 10 座城市",              category="explorer", rarity="common",    condition_json='{"city_count":10}',  reward_mood=15, reward_energy=10),
    dict(code="explorer_20",     name="旅途追风者",     description="解锁 20 座城市",              category="explorer", rarity="rare",      condition_json='{"city_count":20}',  reward_mood=20, reward_energy=15),
    dict(code="explorer_30",     name="城市猎人",       description="解锁 30 座城市",              category="explorer", rarity="rare",      condition_json='{"city_count":30}',  reward_mood=25, reward_energy=20),
    dict(code="explorer_50",     name="行走的地图",     description="解锁 50 座城市",              category="explorer", rarity="epic",      condition_json='{"city_count":50}',  reward_mood=40, reward_energy=30),
    dict(code="explorer_80",     name="中国通",         description="解锁 80 座城市",              category="explorer", rarity="epic",      condition_json='{"city_count":80}',  reward_mood=50, reward_energy=40),
    dict(code="explorer_100",    name="百城旅人",       description="解锁 100 座城市",             category="explorer", rarity="legendary", condition_json='{"city_count":100}', reward_mood=80, reward_energy=60),
    dict(code="explorer_all",    name="神州踏遍",       description="解锁全部城市，踏遍神州大地",   category="explorer", rarity="legendary", condition_json='{"city_count":300}', reward_mood=100,reward_energy=100),

    # ── 地区类 regional ────────────────────────────────────────────────
    dict(code="north_china",     name="北方印记",       description="打卡北京、天津、河北、山西、内蒙古全部省市", category="regional", rarity="rare",      condition_json='{"provinces":["北京","天津","河北","山西","内蒙古"]}', reward_mood=20, reward_energy=15),
    dict(code="east_china",      name="江南水乡",       description="打卡上海、江苏、浙江、安徽、福建、江西、山东", category="regional", rarity="rare",      condition_json='{"provinces":["上海","江苏","浙江","安徽","福建","江西","山东"]}', reward_mood=20, reward_energy=15),
    dict(code="south_china",     name="岭南风情",       description="打卡广东、广西、海南全部省市", category="regional", rarity="rare",      condition_json='{"provinces":["广东","广西","海南"]}', reward_mood=20, reward_energy=15),
    dict(code="central_china",   name="中原腹地",       description="打卡湖北、湖南、河南全部省市", category="regional", rarity="rare",      condition_json='{"provinces":["湖北","湖南","河南"]}', reward_mood=20, reward_energy=15),
    dict(code="southwest_china", name="西南奇境",       description="打卡重庆、四川、贵州、云南、西藏", category="regional", rarity="epic",      condition_json='{"provinces":["重庆","四川","贵州","云南","西藏"]}', reward_mood=35, reward_energy=25),
    dict(code="northwest_china", name="大漠雄风",       description="打卡陕西、甘肃、青海、宁夏、新疆", category="regional", rarity="epic",      condition_json='{"provinces":["陕西","甘肃","青海","宁夏","新疆"]}', reward_mood=35, reward_energy=25),
    dict(code="northeast_china", name="白山黑水",       description="打卡辽宁、吉林、黑龙江全部省市", category="regional", rarity="rare",      condition_json='{"provinces":["辽宁","吉林","黑龙江"]}', reward_mood=20, reward_energy=15),
    dict(code="hmt",             name="港澳台旅人",     description="打卡香港、澳门、台湾",         category="regional", rarity="epic",      condition_json='{"provinces":["香港","澳门","台湾"]}', reward_mood=40, reward_energy=30),
    dict(code="all_regions",     name="九州同游",       description="完成全部七大地区打卡",         category="regional", rarity="legendary", condition_json='{"all_regions":true}', reward_mood=80, reward_energy=60),

    # ── 美食类 foodie ──────────────────────────────────────────────────
    dict(code="foodie_start",    name="吃货觉醒",       description="打卡第一座以美食闻名的城市",   category="foodie",   rarity="common",    condition_json='{"foodie_city":1}',  reward_mood=10, reward_energy=5),
    dict(code="sichuan_fan",     name="无辣不欢",       description="打卡成都或重庆",               category="foodie",   rarity="common",    condition_json='{"cities":["成都","重庆"]}', reward_mood=15, reward_energy=10),
    dict(code="canton_fan",      name="早茶达人",       description="打卡广州",                     category="foodie",   rarity="common",    condition_json='{"cities":["广州"]}', reward_mood=15, reward_energy=10),
    dict(code="foodie_10",       name="美食侦探",       description="打卡 10 座美食城市",           category="foodie",   rarity="rare",      condition_json='{"foodie_city":10}', reward_mood=25, reward_energy=15),
    dict(code="foodie_master",   name="舌尖上的中国",   description="打卡 20 座美食城市",           category="foodie",   rarity="epic",      condition_json='{"foodie_city":20}', reward_mood=40, reward_energy=25),

    # ── 社交类 social ──────────────────────────────────────────────────
    dict(code="first_post",      name="初次发言",       description="在社区发布第一篇帖子",         category="social",   rarity="common",    condition_json='{"post_count":1}',   reward_mood=10, reward_energy=5),
    dict(code="social_5",        name="活跃旅人",       description="在社区发布 5 篇帖子",          category="social",   rarity="common",    condition_json='{"post_count":5}',   reward_mood=15, reward_energy=10),
    dict(code="social_20",       name="旅行博主",       description="在社区发布 20 篇帖子",         category="social",   rarity="rare",      condition_json='{"post_count":20}',  reward_mood=25, reward_energy=15),
    dict(code="social_star",     name="社区明星",       description="在社区发布 50 篇帖子",         category="social",   rarity="epic",      condition_json='{"post_count":50}',  reward_mood=40, reward_energy=25),

    # ── 养成类 companion ───────────────────────────────────────────────
    dict(code="pet_hello",       name="桌宠初见",       description="第一次与桌宠互动",             category="companion",rarity="common",    condition_json='{"pet_interaction":1}', reward_mood=10, reward_energy=5),
    dict(code="pet_happy",       name="好朋友",         description="桌宠心情值达到 80",            category="companion",rarity="rare",      condition_json='{"pet_mood":80}',    reward_mood=20, reward_energy=15),
    dict(code="pet_full",        name="喂饱它",         description="桌宠能量值达到满值",           category="companion",rarity="rare",      condition_json='{"pet_energy":100}', reward_mood=20, reward_energy=15),
    dict(code="pet_legend",      name="灵魂伴侣",       description="与桌宠互动超过 100 次",        category="companion",rarity="legendary", condition_json='{"pet_interaction":100}', reward_mood=60, reward_energy=50),
]


def seed():
    with Session(engine) as session:
        existing = {a.code for a in session.exec(select(Achievement)).all()}
        added = 0
        for data in ACHIEVEMENTS:
            if data["code"] in existing:
                continue
            session.add(Achievement(**data))
            added += 1
        session.commit()
        print(f"✅ 成功插入 {added} 条成就数据（已跳过 {len(existing)} 条已有数据）")
        total = len(session.exec(select(Achievement)).all())
        print(f"📊 数据库现有成就总数：{total}")


if __name__ == "__main__":
    seed()