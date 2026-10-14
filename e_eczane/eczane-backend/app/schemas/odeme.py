from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from decimal import Decimal
import re


class KartBilgisi(BaseModel):
    kart_numarasi: str = Field(..., description="16 haneli kart numarası")
    son_kullanma_ay: str = Field(..., description="Son kullanma ayı (MM)")
    son_kullanma_yil: str = Field(..., description="Son kullanma yılı (YY)")
    cvv: str = Field(..., description="3 haneli güvenlik kodu")
    kart_sahibi: str = Field(..., description="Kart sahibi adı")
    
    @field_validator('kart_numarasi')
    @classmethod
    def validate_kart_numarasi(cls, v):
        cleaned = re.sub(r'\s+', '', v)
        if not cleaned.isdigit() or len(cleaned) != 16:
            raise ValueError('Kart numarası 16 haneli olmalıdır')
        return cleaned
    
    @field_validator('son_kullanma_ay')
    @classmethod
    def validate_ay(cls, v):
        if not v.isdigit() or len(v) != 2 or int(v) < 1 or int(v) > 12:
            raise ValueError('Geçerli bir ay girin (01-12)')
        return v
    
    @field_validator('son_kullanma_yil')
    @classmethod
    def validate_yil(cls, v):
        if not v.isdigit() or len(v) != 2:
            raise ValueError('Geçerli bir yıl girin (YY)')
        return v
    
    @field_validator('cvv')
    @classmethod
    def validate_cvv(cls, v):
        if not v.isdigit() or len(v) != 3:
            raise ValueError('CVV 3 haneli olmalıdır')
        return v


class OdemeRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "kart_bilgisi": {
                    "kart_numarasi": "4111111111111111",
                    "son_kullanma_ay": "12",
                    "son_kullanma_yil": "25",
                    "cvv": "123",
                    "kart_sahibi": "AHMET YILMAZ"
                },
                "tutar": "125.50",
                "siparis_bilgileri": {
                    "eczane_id": "123e4567-e89b-12d3-a456-426614174000",
                    "items": [],
                    "teslimat_adresi": "İstanbul",
                    "recete_id": None
                }
            }
        }
    )
    
    kart_bilgisi: KartBilgisi
    tutar: Decimal = Field(..., ge=0, decimal_places=2, description="Ödeme tutarı (TL)")
    siparis_bilgileri: dict = Field(..., description="Sipariş oluşturma verileri")


class OdemeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    basarili: bool = Field(..., description="Ödeme başarılı mı?")
    islem_id: Optional[str] = Field(None, description="Ödeme işlem ID")
    mesaj: str = Field(..., description="Ödeme sonucu mesajı")
    siparis_id: Optional[str] = Field(None, description="Oluşturulan sipariş ID")
    siparis_no: Optional[str] = Field(None, description="Oluşturulan sipariş numarası")


TEST_KARTLARI = {
    "4111111111111111": {"basarili": True, "mesaj": "Ödeme başarıyla tamamlandı"},
    "5500000000000004": {"basarili": True, "mesaj": "Ödeme başarıyla tamamlandı"},
    "4000000000000002": {"basarili": False, "mesaj": "Yetersiz bakiye"},
    "4000000000009995": {"basarili": False, "mesaj": "Geçersiz kart"},
}


def validate_payment(kart_numarasi: str) -> dict:
    cleaned = re.sub(r'\s+', '', kart_numarasi)
    
    if cleaned in TEST_KARTLARI:
        return TEST_KARTLARI[cleaned]
    
    if cleaned.startswith('4') or cleaned.startswith('5'):
        return {"basarili": True, "mesaj": "Ödeme başarıyla tamamlandı"}
    
    return {"basarili": False, "mesaj": "Kart doğrulanamadı"}
