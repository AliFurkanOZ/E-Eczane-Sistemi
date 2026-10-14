"""
Sipariş Durum Geçmişi Pydantic şemaları — DynamoDB (NoSQL) için
"""
from pydantic import BaseModel
from typing import Optional


class DurumGecmisiCreate(BaseModel):
    """Sipariş durum geçmişi oluşturma şeması"""
    siparis_id: str
    siparis_no: str
    eski_durum: Optional[str] = None
    yeni_durum: str
    aciklama: Optional[str] = None
    degistiren_user_id: str
    metadata: Optional[dict] = None


class DurumGecmisiResponse(BaseModel):
    """Sipariş durum geçmişi yanıt şeması"""
    id: str
    siparis_id: str
    siparis_no: str
    eski_durum: Optional[str] = None
    yeni_durum: str
    aciklama: Optional[str] = None
    degistiren_user_id: str
    metadata: Optional[dict] = None
    created_at: str
