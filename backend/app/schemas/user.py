"""
User schemas
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    auth_id: str


class UserUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None


class UserResponse(UserBase):
    id: int
    auth_id: str
    avatar_url: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
