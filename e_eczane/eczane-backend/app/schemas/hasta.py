from pydantic import BaseModel, Field, field_validator, field_serializer, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID
import re


class HastaBase(BaseModel):
    """Hasta base schema"""
    tc_no: str = Field(..., min_length=11, max_length=11)
    ad: str = Field(..., min_length=2, max_length=100)
    soyad: str = Field(..., min_length=2, max_length=100)
    adres: str = Field(..., min_length=10, max_length=500)
    telefon: str = Field(..., min_length=10, max_length=20)
    profil_resmi_url: Optional[str] = None
    
    @field_validator('tc_no')
    @classmethod
    def validate_tc_no(cls, v):
        """TC No validasyonu"""
        if not v.isdigit():
            raise ValueError('TC Kimlik No sadece rakamlardan oluşmalıdır')
        if len(v) != 11:
            raise ValueError('TC Kimlik No 11 haneli olmalıdır')
        return v
    
    @field_validator('telefon')
    @classmethod
    def validate_telefon(cls, v):
        """Telefon validasyonu"""
        # Sadece rakamlar ve + işareti
        telefon = re.sub(r'[^\d+]', '', v)
        if len(telefon) < 10:
            raise ValueError('Geçerli bir telefon numarası giriniz')
        return telefon


class HastaCreate(HastaBase):
    """Hasta kayıt schema"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "tc_no": "12345678901",
                "ad": "Ahmet",
                "soyad": "Yılmaz",
                "adres": "Atatürk Cad. No:123 Çankaya/ANKARA",
                "telefon": "05551234567",
                "email": "ahmet@example.com",
                "password": "SecurePass123!"
            }
        }
    )
    
    email: str
    password: str = Field(..., min_length=6)


class HastaUpdate(BaseModel):
    """Hasta güncelleme schema"""
    ad: Optional[str] = Field(None, min_length=2, max_length=100)
    soyad: Optional[str] = Field(None, min_length=2, max_length=100)
    adres: Optional[str] = Field(None, min_length=10, max_length=500)
    telefon: Optional[str] = Field(None, min_length=10, max_length=20)
    profil_resmi_url: Optional[str] = None


class HastaResponse(HastaBase):
    """Hasta response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('id', 'user_id')
    def serialize_uuid(self, value: UUID) -> str:
        return str(value)


class HastaProfileResponse(HastaResponse):
    """Hasta profil response schema (email ile birlikte)"""
    email: str