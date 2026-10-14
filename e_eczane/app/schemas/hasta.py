from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class HastaProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    email: str
    tc_no: str
    ad: str
    soyad: str
    adres: str
    telefon: str
    profil_resmi_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class HastaCreate(BaseModel):
    tc_no: str = Field(..., min_length=11, max_length=11)
    ad: str
    soyad: str
    adres: str
    telefon: str
    email: str
    password: str
