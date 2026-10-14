from pydantic import BaseModel, Field, ConfigDict, field_serializer
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from uuid import UUID


class StokBase(BaseModel):
    """Stok base schema"""
    ilac_id: str
    miktar: int = Field(..., ge=0, description="Stok miktarı")
    min_stok: int = Field(default=10, ge=0, description="Minimum stok uyarı seviyesi")


class StokCreate(StokBase):
    """Stok oluşturma"""
    pass


class StokUpdate(BaseModel):
    """Stok güncelleme"""
    miktar: Optional[int] = Field(None, ge=0, description="Yeni stok miktarı")
    min_stok: Optional[int] = Field(None, ge=0, description="Yeni minimum stok seviyesi")


class StokResponse(BaseModel):
    """Stok response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    eczane_id: UUID
    ilac_id: UUID
    miktar: int
    min_stok: int
    stok_durumu: str = Field(..., description="Stok durumu: tukendi, azaliyor, yeterli")
    ilac_adi: str
    ilac_barkod: str
    ilac_fiyat: Decimal
    ilac_kategori: str = Field(default="", description="İlaç kategorisi")
    ilac_kullanim_talimati: str = Field(default="", description="Kullanım talimatı")
    ilac_etken_madde: Optional[str] = Field(None, description="Etken madde")
    ilac_firma: Optional[str] = Field(None, description="Üretici firma")
    ilac_receteli: bool = Field(default=False, description="Reçeteli mi")
    ilac_prospektus_url: Optional[str] = Field(None, description="Prospektüs URL")
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('id', 'eczane_id', 'ilac_id')
    def serialize_uuid(self, value: UUID) -> str:
        return str(value)


class StokUyari(BaseModel):
    """Stok uyarısı"""
    model_config = ConfigDict(from_attributes=True)
    
    ilac_id: str
    ilac_adi: str
    mevcut_miktar: int
    min_stok: int
    durum: str = Field(..., description="Durum: tukendi veya azaliyor")


class IlacEkle(BaseModel):
    """Reçetesiz ilaç ekleme (eczane için)"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "barkod": "8699444444444",
                "ad": "Aspirin 100mg",
                "kategori": "normal",
                "kullanim_talimati": "Günde 1 kez 1 tablet",
                "fiyat": "12.50",
                "etken_madde": "Asetilsalisilik Asit",
                "firma": "Bayer",
                "receteli": False,
                "baslangic_stok": 100,
                "min_stok": 20
            }
        }
    )
    
    barkod: str = Field(..., min_length=3, max_length=50, description="İlaç barkodu")
    ad: str = Field(..., min_length=3, max_length=200, description="İlaç adı")
    kategori: str = Field(..., description="Kategori: normal, kirmizi_recete, soguk_zincir")
    kullanim_talimati: str = Field(..., min_length=10, description="Kullanım talimatı")
    fiyat: Decimal = Field(..., gt=0, decimal_places=2, description="İlaç fiyatı (TL)")
    etken_madde: Optional[str] = Field(None, max_length=200, description="Etken madde")
    firma: Optional[str] = Field(None, max_length=200, description="Üretici firma")
    receteli: bool = Field(default=False, description="Reçeteli mi")
    baslangic_stok: int = Field(..., ge=1, description="Başlangıç stok miktarı")
    min_stok: int = Field(default=10, ge=0, description="Minimum stok uyarı seviyesi")
