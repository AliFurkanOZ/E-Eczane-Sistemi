from pydantic import BaseModel, Field, field_serializer, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.utils.enums import IlacKategori
from uuid import UUID


class IlacBase(BaseModel):
    """İlaç base schema"""
    barkod: str = Field(..., min_length=1, max_length=50)
    ad: str = Field(..., min_length=2, max_length=200)
    kategori: IlacKategori
    kullanim_talimati: str = Field(..., min_length=10)
    fiyat: Decimal = Field(..., gt=0, decimal_places=2)
    receteli: bool
    etken_madde: Optional[str] = Field(None, max_length=200)
    firma: Optional[str] = Field(None, max_length=200)


class IlacCreate(IlacBase):
    """İlaç oluşturma (Admin veya Eczane için)"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "barkod": "8699546325789",
                "ad": "Parol 500mg 20 Tablet",
                "kategori": "normal",
                "kullanim_talimati": "Günde 3 defa 1 tablet alınız. Yemeklerden sonra kullanınız.",
                "fiyat": "45.50",
                "receteli": False,
                "etken_madde": "Parasetamol",
                "firma": "Atabay İlaç",
                "prospektus_url": "https://example.com/parol-prospektus.pdf"
            }
        }
    )
    
    prospektus_url: Optional[str] = Field(None, max_length=500)


class IlacUpdate(BaseModel):
    """İlaç güncelleme"""
    ad: Optional[str] = Field(None, min_length=2, max_length=200)
    kullanim_talimati: Optional[str] = Field(None, min_length=10)
    fiyat: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    aktif: Optional[bool] = None
    prospektus_url: Optional[str] = Field(None, max_length=500)


class MuadilIlacResponse(BaseModel):
    """Muadil ilaç response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    barkod: str
    ad: str
    fiyat: Decimal
    firma: Optional[str]
    
    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)


class IlacResponse(IlacBase):
    """İlaç response schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    aktif: bool
    prospektus_url: Optional[str]
    created_at: datetime
    
    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)



class IlacWithStokResponse(IlacResponse):
    """Stok bilgisi ile ilaç response"""
    stok_durumu: Optional[str] = Field(None, description="tukendi, azaliyor, yeterli")
    stok_miktari: Optional[int] = Field(None, ge=0)


class IlacSearchParams(BaseModel):
    """İlaç arama parametreleri"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "query": "parol",
                "kategori": "normal",
                "receteli": False,
                "min_fiyat": "10.00",
                "max_fiyat": "100.00",
                "page": 1,
                "page_size": 20
            }
        }
    )
    
    query: Optional[str] = Field(None, description="İlaç adı, barkod veya etken madde")
    kategori: Optional[IlacKategori] = None
    receteli: Optional[bool] = None
    min_fiyat: Optional[Decimal] = Field(None, ge=0)
    max_fiyat: Optional[Decimal] = Field(None, ge=0)
    page: int = Field(1, ge=1, description="Sayfa numarası")
    page_size: int = Field(20, ge=1, le=100, description="Sayfa başına kayıt")


class IlacSearchResponse(BaseModel):
    """İlaç arama sonucu response"""
    items: List[IlacResponse]
    total: int = Field(..., ge=0, description="Toplam kayıt sayısı")
    page: int = Field(..., ge=1, description="Mevcut sayfa")
    page_size: int = Field(..., ge=1, description="Sayfa başına kayıt")
    total_pages: int = Field(..., ge=0, description="Toplam sayfa sayısı")
