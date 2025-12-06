from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from decimal import Decimal


class SepetItem(BaseModel):
    """Sepetteki bir ürün"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "ilac_id": "123e4567-e89b-12d3-a456-426614174000",
                "ilac_adi": "Parol 500mg",
                "barkod": "8699123456789",
                "miktar": 2,
                "birim_fiyat": "25.50",
                "ara_toplam": "51.00",
                "receteli": False
            }
        }
    )
    
    ilac_id: str
    ilac_adi: str
    barkod: str
    miktar: int = Field(..., ge=1, description="Ürün miktarı (en az 1)")
    birim_fiyat: Decimal = Field(..., ge=0, decimal_places=2, description="Birim fiyat (TL)")
    ara_toplam: Decimal = Field(..., ge=0, decimal_places=2, description="Ara toplam (TL)")
    receteli: bool


class SepetAddItem(BaseModel):
    """Sepete ürün ekleme"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "ilac_id": "123e4567-e89b-12d3-a456-426614174000",
                "miktar": 2
            }
        }
    )
    
    ilac_id: str
    miktar: int = Field(..., ge=1, le=100, description="Ürün miktarı (1-100 arası)")


class SepetUpdateItem(BaseModel):
    """Sepetteki ürün miktarını güncelleme"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "miktar": 3
            }
        }
    )
    
    miktar: int = Field(..., ge=0, le=100, description="Yeni miktar (0 ise ürün silinir, 1-100 arası)")


class SepetResponse(BaseModel):
    """Sepet response"""
    model_config = ConfigDict(from_attributes=True)
    
    items: List[SepetItem]
    toplam_urun: int = Field(..., ge=0, description="Sepetteki toplam ürün sayısı")
    toplam_tutar: Decimal = Field(..., ge=0, decimal_places=2, description="Sepetteki toplam tutar (TL)")
    recete_id: Optional[str] = Field(None, description="İlgili reçete ID (varsa)")
