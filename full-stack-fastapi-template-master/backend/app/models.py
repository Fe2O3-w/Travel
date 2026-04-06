import uuid
from datetime import datetime, timezone

from pydantic import EmailStr
from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
# ── 追加到 models.py 末尾 ──────────────────────────────────────

from enum import Enum as PyEnum
from typing import Optional

class AchievementCategory(str, PyEnum):
    EXPLORER  = "explorer"
    REGIONAL  = "regional"
    FOODIE    = "foodie"
    SOCIAL    = "social"
    COMPANION = "companion"

class AchievementRarity(str, PyEnum):
    COMMON    = "common"
    RARE      = "rare"
    EPIC      = "epic"
    LEGENDARY = "legendary"

class Achievement(SQLModel, table=True):
    __tablename__ = "achievements"
    id             : int | None           = Field(default=None, primary_key=True)
    code           : str                  = Field(unique=True, index=True, max_length=64)
    name           : str                  = Field(max_length=64)
    description    : str                  = Field(max_length=256)
    category       : AchievementCategory
    rarity         : AchievementRarity    = Field(default=AchievementRarity.COMMON)
    icon_url       : str | None           = Field(default=None, max_length=256)
    condition_json : str                  = Field(default="{}")
    reward_mood    : int                  = Field(default=0)
    reward_energy  : int                  = Field(default=0)
    created_at     : datetime             = Field(default_factory=datetime.utcnow)

class UserAchievement(SQLModel, table=True):
    __tablename__ = "user_achievements"
    id             : int | None = Field(default=None, primary_key=True)
    user_id        : uuid.UUID  = Field(foreign_key="user.id", index=True)
    achievement_id : int        = Field(foreign_key="achievements.id")
    unlocked_at    : datetime   = Field(default_factory=datetime.utcnow)

class CityVisit(SQLModel, table=True):
    __tablename__ = "city_visits"
    id         : int | None = Field(default=None, primary_key=True)
    user_id    : uuid.UUID  = Field(foreign_key="user.id", index=True)
    city_name  : str        = Field(max_length=32, index=True)
    province   : str        = Field(max_length=32)
    visited_at : datetime   = Field(default_factory=datetime.utcnow)
    source     : str        = Field(default="manual", max_length=16)