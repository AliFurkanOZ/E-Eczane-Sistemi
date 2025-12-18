from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class AdminCreate(BaseModel):
    """Admin oluşturma"""
    ad: str = Field(..., min_length=2, max_length=100)
    soyad: str = Field(..., min_length=2, max_length=100)
    telefon: str = Field(..., min_length=10, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=6)


class AdminResponse(BaseModel):
    """Admin response"""
    id: str
    user_id: str
    ad: str
    soyad: str
    telefon: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class EczaneOnayDetay(BaseModel):
    """Eczane onay detayları"""
    id: str
    user_id: str
    sicil_no: str
    eczane_adi: str
    adres: str
    telefon: str
    mahalle: str
    email: str
    eczaci_adi: str
    eczaci_soyadi: str
    eczaci_diploma_no: str
    banka_hesap_no: str
    iban: str
    onay_durumu: str
    onay_notu: Optional[str]
    is_active: bool
    created_at: datetime


class EczaneOnayAction(BaseModel):
    """Eczane onay/red işlemi"""
    onay_notu: Optional[str] = Field(None, max_length=500)
    
    class Config:
        json_schema_extra = {
            "example": {
                "onay_notu": "Tüm belgeler uygun, eczane onaylandı"
            }
        }


class KullaniciYonetim(BaseModel):
    """Kullanıcı yönetimi (aktif/pasif)"""
    is_active: bool
    neden: Optional[str] = Field(None, max_length=500)


class DashboardIstatistik(BaseModel):
    """Dashboard istatistikleri"""
    toplam_hasta: int
    toplam_eczane: int
    aktif_eczane: int
    bekleyen_eczane: int
    toplam_siparis: int
    bugunku_siparis: int
    toplam_ciro: float
    bugunku_ciro: float


class SiparisIstatistik(BaseModel):
    """Sipariş istatistikleri"""
    beklemede: int
    onaylandi: int
    hazirlaniyor: int
    yolda: int
    teslim_edildi: int
    iptal_edildi: int


class DoktorDetay(BaseModel):
    """Doktor detay bilgisi (Admin için)"""
    id: str
    user_id: str
    diploma_no: str
    ad: str
    soyad: str
    uzmanlik: Optional[str] = None
    hastane: Optional[str] = None
    telefon: Optional[str] = None
    email: str
    tam_ad: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DoktorDuzenle(BaseModel):
    """Doktor bilgi güncelleme (Admin için)"""
    ad: Optional[str] = Field(None, min_length=2, max_length=100)
    soyad: Optional[str] = Field(None, min_length=2, max_length=100)
    uzmanlik: Optional[str] = Field(None, max_length=100)
    hastane: Optional[str] = Field(None, max_length=200)
    telefon: Optional[str] = Field(None, max_length=20)
