"""
Bildirim Pydantic şemaları — DynamoDB (NoSQL) için
"""
from pydantic import BaseModel
from typing import Optional


class BildirimCreate(BaseModel):
    """Bildirim oluşturma şeması"""
    user_id: str
    baslik: str
    mesaj: str
    tip: str  # "siparis", "sistem", "odeme"
    link: Optional[str] = None


class BildirimResponse(BaseModel):
    """Bildirim yanıt şeması"""
    id: str
    user_id: str
    baslik: str
    mesaj: str
    tip: str
    okundu: bool
    link: Optional[str] = None
    created_at: str
