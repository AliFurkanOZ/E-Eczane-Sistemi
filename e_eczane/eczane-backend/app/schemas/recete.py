from pydantic import BaseModel, Field, field_validator, field_serializer, ConfigDict
from typing import List, Optional
from datetime import date
from decimal import Decimal
from app.utils.enums import IlacKategori
from uuid import UUID


class ReceteIlacItem(BaseModel):
    """Reçetedeki ilaç item"""
    model_config = ConfigDict(from_attributes=True)
    
    ilac_id: str
    barkod: str
    ad: str
    kategori: IlacKategori
    miktar: int = Field(..., gt=0, description="İlaç miktarı (kutu)")
    kullanim_talimati: str
    fiyat: Decimal = Field(..., gt=0, decimal_places=2)
    etken_madde: Optional[str] = None


class ReceteQuery(BaseModel):
    """Reçete sorgulama request"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "tc_no": "12345678901",
                "recete_no": "RCT2025001"
            }
        }
    )
    
    tc_no: str = Field(..., min_length=11, max_length=11, description="TC Kimlik No")
    recete_no: str = Field(..., min_length=3, max_length=50, description="Reçete numarası")
    
    @field_validator('tc_no')
    @classmethod
    def validate_tc_no(cls, v):
        """TC No validasyonu"""
        if not v.isdigit():
            raise ValueError('TC Kimlik No sadece rakamlardan oluşmalıdır')
        if len(v) != 11:
            raise ValueError('TC Kimlik No 11 haneli olmalıdır')
        return v


class ReceteResponse(BaseModel):
    """Reçete response"""
    model_config = ConfigDict(from_attributes=True)
    
    recete_id: Optional[str] = None  # Veritabanındaki reçete ID'si (varsa)
    recete_no: str
    tc_no: str
    tarih: date
    doktor_adi: Optional[str] = None
    hastane: Optional[str] = None
    ilac_listesi: List[ReceteIlacItem]
    toplam_tutar: Decimal = Field(..., ge=0, decimal_places=2, description="Toplam tutar (TL)")
    durum: str = Field(default="aktif", description="Reçete durumu: aktif, kullanildi, iptal")
    kalan_gun: int = Field(default=2, description="Reçetenin geçerliliğinin kalan gün sayısı")
    kullanilabilir: bool = Field(default=True, description="Reçete sipariş için kullanılabilir mi?")


class ReceteCreateRequest(BaseModel):
    """Reçete oluşturma request (Admin için)"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "recete_no": "RCT2025001",
                "tc_no": "12345678901",
                "tarih": "2025-11-30",
                "doktor_adi": "Dr. Mehmet Yılmaz",
                "hastane": "Ankara Üniversitesi Tıp Fakültesi",
                "ilac_listesi": [
                    {
                        "ilac_id": "uuid-here",
                        "miktar": 2
                    }
                ]
            }
        }
    )
    
    recete_no: str = Field(..., min_length=3, max_length=50)
    tc_no: str = Field(..., min_length=11, max_length=11)
    tarih: date
    doktor_adi: Optional[str] = Field(None, max_length=200)
    hastane: Optional[str] = Field(None, max_length=200)
    ilac_listesi: List[dict] = Field(..., min_length=1, description="[{ilac_id: str, miktar: int}]")
    
    @field_validator('tc_no')
    @classmethod
    def validate_tc_no(cls, v):
        """TC No validasyonu"""
        if not v.isdigit():
            raise ValueError('TC Kimlik No sadece rakamlardan oluşmalıdır')
        if len(v) != 11:
            raise ValueError('TC Kimlik No 11 haneli olmalıdır')
        return v
