from pydantic import BaseModel, EmailStr, Field, field_serializer, ConfigDict
from typing import Optional
from datetime import datetime
from app.utils.enums import UserType
from uuid import UUID


class UserBase(BaseModel):
    """User base schema"""
    email: EmailStr
    user_type: UserType


class UserCreate(UserBase):
    """User oluşturma schema"""
    password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    """User response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    is_active: bool
    created_at: datetime
    
    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)


class UserInDB(UserBase):
    """User database schema (password hash ile)"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    password_hash: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
