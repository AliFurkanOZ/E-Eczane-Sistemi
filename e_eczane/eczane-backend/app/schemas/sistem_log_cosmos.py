"""
Sistem Log Pydantic şemaları — DynamoDB (NoSQL) için
"""
from pydantic import BaseModel
from typing import Optional


class SistemLogCreate(BaseModel):
    """Sistem log oluşturma şeması"""
    log_level: str  # "INFO", "WARNING", "ERROR"
    event_type: str  # "SIPARIS_OLUSTURULDU", "SIPARIS_GUNCELLENDI", vb.
    user_id: Optional[str] = None
    details: dict
    message: str


class SistemLogResponse(BaseModel):
    """Sistem log yanıt şeması"""
    id: str
    log_level: str
    event_type: str
    user_id: Optional[str] = None
    details: dict
    message: str
    timestamp: str
