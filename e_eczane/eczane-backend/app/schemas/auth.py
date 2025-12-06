from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional
from app.utils.enums import UserType
import re


class UserLogin(BaseModel):
    """Login request schema"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "identifier": "12345678901",
                "password": "SecurePass123!",
                "user_type": "hasta"
            }
        }
    )
    
    identifier: str = Field(..., description="Email, TC No veya Sicil No")
    password: str = Field(..., min_length=6, description="Şifre")
    user_type: UserType = Field(..., description="Kullanıcı tipi")


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_type: UserType
    user_id: str


class TokenRefresh(BaseModel):
    """Token refresh request schema"""
    refresh_token: str


class PasswordChange(BaseModel):
    """Şifre değiştirme schema"""
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=8)
    new_password_confirm: str = Field(..., min_length=8)
    
    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v):
        """Şifre güvenlik kontrolü"""
        if len(v) < 8:
            raise ValueError('Şifre en az 8 karakter olmalıdır')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Şifre en az bir büyük harf içermelidir')
        if not re.search(r'[a-z]', v):
            raise ValueError('Şifre en az bir küçük harf içermelidir')
        if not re.search(r'[0-9]', v):
            raise ValueError('Şifre en az bir rakam içermelidir')
        return v
    
    @field_validator('new_password_confirm')
    @classmethod
    def passwords_match(cls, v, info):
        """Şifrelerin eşleşmesi kontrolü"""
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Şifreler eşleşmiyor')
        return v
