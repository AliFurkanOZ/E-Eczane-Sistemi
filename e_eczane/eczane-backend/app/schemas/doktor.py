from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class DoktorCreate(BaseModel):
    """Doktor kayıt şeması"""
    email: EmailStr
    password: str = Field(..., min_length=6)
    diploma_no: str = Field(..., min_length=5, max_length=50)
    ad: str = Field(..., min_length=2, max_length=100)
    soyad: str = Field(..., min_length=2, max_length=100)
    uzmanlik: Optional[str] = Field(None, max_length=100)
    hastane: Optional[str] = Field(None, max_length=200)
    telefon: Optional[str] = Field(None, max_length=20)


class DoktorResponse(BaseModel):
    """Doktor yanıt şeması"""
    id: str
    user_id: str
    diploma_no: str
    ad: str
    soyad: str
    uzmanlik: Optional[str] = None
    hastane: Optional[str] = None
    telefon: Optional[str] = None
    tam_ad: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class DoktorProfileResponse(BaseModel):
    """Doktor profil yanıt şeması"""
    id: str
    diploma_no: str
    ad: str
    soyad: str
    uzmanlik: Optional[str] = None
    hastane: Optional[str] = None
    telefon: Optional[str] = None
    email: str
    
    class Config:
        from_attributes = True


class ReceteCreate(BaseModel):
    """Reçete oluşturma şeması (Doktor için)"""
    tc_no: str = Field(..., min_length=11, max_length=11, description="Hasta TC Kimlik No")
    ilaclar: list = Field(..., min_items=1, description="İlaç listesi")


class ReceteIlacCreate(BaseModel):
    """Reçete ilaç ekleme şeması"""
    ilac_id: str
    miktar: int = Field(..., ge=1)
    kullanim_talimati: Optional[str] = Field(None, max_length=500)
