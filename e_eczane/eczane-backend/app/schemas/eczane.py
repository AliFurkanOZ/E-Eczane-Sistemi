from pydantic import BaseModel, Field, field_validator, field_serializer, ConfigDict
from typing import Optional
from datetime import datetime
from app.utils.enums import OnayDurumu
from uuid import UUID
import re


class EczaneBase(BaseModel):
    """Eczane base schema"""
    sicil_no: str = Field(..., min_length=3, max_length=50)
    eczane_adi: str = Field(..., min_length=3, max_length=200)
    adres: str = Field(..., min_length=10, max_length=500)
    telefon: str = Field(..., min_length=10, max_length=20)
    mahalle: str = Field(..., min_length=2, max_length=100)
    ilce: Optional[str] = Field(None, max_length=100)
    il: Optional[str] = Field(None, max_length=100)
    
    eczaci_adi: str = Field(..., min_length=2, max_length=100)
    eczaci_soyadi: str = Field(..., min_length=2, max_length=100)
    eczaci_diploma_no: str = Field(..., min_length=3, max_length=50)
    
    banka_hesap_no: str = Field(..., min_length=10, max_length=50)
    iban: str = Field(..., min_length=24, max_length=34)  # IBAN with spaces can be longer
    
    @field_validator('iban')
    @classmethod
    def validate_iban(cls, v):
        """IBAN validasyonu"""
        # TR ile başlamalı ve 26 karakter olmalı (boşluklar temizlendikten sonra)
        iban = v.replace(' ', '').upper()
        if not iban.startswith('TR'):
            raise ValueError('IBAN TR ile başlamalıdır')
        if len(iban) != 26:
            raise ValueError('IBAN 26 karakter olmalıdır (boşluksuz)')
        return iban
    
    @field_validator('banka_hesap_no')
    @classmethod
    def validate_banka_hesap_no(cls, v):
        """Banka hesap numarası sadece rakam olmalı"""
        cleaned = v.strip()
        if not cleaned.isdigit():
            raise ValueError('Banka hesap numarası sadece rakam içermelidir')
        if len(cleaned) < 10:
            raise ValueError('Banka hesap numarası en az 10 hane olmalıdır')
        return cleaned
    
    @field_validator('telefon')
    @classmethod
    def validate_telefon(cls, v):
        """Telefon numarası sadece rakam olmalı"""
        # Boşlukları ve tire işaretlerini temizle
        cleaned = ''.join(filter(str.isdigit, v))
        if len(cleaned) < 10 or len(cleaned) > 11:
            raise ValueError('Telefon numarası 10-11 hane olmalıdır')
        return cleaned


class EczaneCreate(EczaneBase):
    """Eczane kayıt schema"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sicil_no": "ANK123456",
                "eczane_adi": "Şifa Eczanesi",
                "adres": "Kızılay Meydanı No:45 Çankaya/ANKARA",
                "telefon": "03121234567",
                "mahalle": "Kızılay",
                "ilce": "Çankaya",
                "il": "Ankara",
                "eczaci_adi": "Mehmet",
                "eczaci_soyadi": "Demir",
                "eczaci_diploma_no": "ECZ123456",
                "banka_hesap_no": "1234567890",
                "iban": "TR330006100519786457841326",
                "email": "sifa@eczane.com",
                "password": "SecurePass123!"
            }
        }
    )
    
    email: str
    password: str = Field(..., min_length=6)


class EczaneUpdate(BaseModel):
    """Eczane güncelleme schema"""
    eczane_adi: Optional[str] = None
    adres: Optional[str] = None
    telefon: Optional[str] = None
    mahalle: Optional[str] = None
    ilce: Optional[str] = None
    il: Optional[str] = None
    banka_hesap_no: Optional[str] = None
    iban: Optional[str] = None


class EczaneResponse(EczaneBase):
    """Eczane response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    onay_durumu: OnayDurumu
    onay_notu: Optional[str]
    created_at: datetime
    
    @field_serializer('id', 'user_id')
    def serialize_uuid(self, value: UUID) -> str:
        return str(value)
