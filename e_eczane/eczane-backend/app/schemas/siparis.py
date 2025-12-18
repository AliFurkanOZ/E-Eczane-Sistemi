from pydantic import BaseModel, Field, ConfigDict, field_serializer
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from app.utils.enums import SiparisDurum, OdemeDurum
from uuid import UUID


class SiparisDetayItem(BaseModel):
    """Sipariş detay item"""
    model_config = ConfigDict(from_attributes=True)
    
    ilac_id: str
    ilac_adi: str
    barkod: str
    miktar: int = Field(..., gt=0, description="Ürün miktarı")
    birim_fiyat: Decimal = Field(..., ge=0, decimal_places=2, description="Birim fiyat (TL)")
    ara_toplam: Decimal = Field(..., ge=0, decimal_places=2, description="Ara toplam (TL)")


class SiparisCreate(BaseModel):
    """Sipariş oluşturma"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "eczane_id": "123e4567-e89b-12d3-a456-426614174000",
                "recete_id": None,
                "items": [
                    {
                        "ilac_id": "456e4567-e89b-12d3-a456-426614174000",
                        "ilac_adi": "Parol 500mg",
                        "barkod": "8699123456789",
                        "miktar": 2,
                        "birim_fiyat": "25.50",
                        "ara_toplam": "51.00"
                    }
                ],
                "teslimat_adresi": "Atatürk Cad. No:123 Çankaya/ANKARA",
                "siparis_notu": "Kapı zili çalışmıyor, lütfen arayın"
            }
        }
    )
    
    eczane_id: str
    recete_id: Optional[str] = None
    items: List[SiparisDetayItem] = Field(..., min_length=1, description="Sipariş kalemleri")
    teslimat_adresi: str = Field("", max_length=500, description="Teslimat adresi")
    siparis_notu: Optional[str] = Field(None, max_length=500, description="Sipariş notu")


class SiparisResponse(BaseModel):
    """Sipariş response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    siparis_no: str
    eczane_id: str
    eczane_adi: str
    hasta_id: str
    hasta_adi: str
    recete_id: Optional[str] = None
    toplam_tutar: Decimal = Field(..., ge=0, decimal_places=2, description="Toplam tutar (TL)")
    durum: SiparisDurum
    odeme_durumu: OdemeDurum
    teslimat_adresi: str
    siparis_notu: Optional[str] = None
    iptal_nedeni: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    detaylar: List[SiparisDetayItem]


class SiparisDurumGuncelle(BaseModel):
    """Sipariş durumu güncelleme (Eczane için)"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "yeni_durum": "hazirlaniyor",
                "aciklama": "Siparişiniz hazırlanmaya başlandı"
            }
        }
    )
    
    yeni_durum: SiparisDurum
    aciklama: Optional[str] = Field(None, max_length=500, description="Durum değişikliği açıklaması")


class SiparisIptal(BaseModel):
    """Sipariş iptal etme - Eczane için (neden zorunlu)"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "iptal_nedeni": "Stok yetersizliği nedeniyle sipariş iptal edilmiştir."
            }
        }
    )
    
    iptal_nedeni: str = Field(..., min_length=10, max_length=500, description="İptal nedeni (eczane için zorunlu)")


class HastaIptal(BaseModel):
    """Sipariş iptal etme - Hasta için (neden opsiyonel)"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {}
        }
    )
    
    # Hasta için iptal nedeni opsiyonel, varsayılan değer kullanılır



class EczaneListItem(BaseModel):
    """Eczane liste item - Stok durumu ile birlikte"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    eczane_adi: str
    adres: str
    telefon: str
    mahalle: str
    ilce: Optional[str] = None
    il: Optional[str] = None
    eczaci_tam_ad: str
    stok_durumu: Dict[str, Dict[str, Any]] = Field(
        ..., 
        description="İlaç stok durumu: {ilac_id: {'miktar': int, 'stok_durumu': str}}"
    )
    tum_urunler_mevcut: bool = Field(..., description="Tüm ürünler stoklarda mevcut mu?")

