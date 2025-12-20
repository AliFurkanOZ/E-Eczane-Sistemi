from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Hasta(BaseModel):
    """Hasta modeli"""
    __tablename__ = "hastalar"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    tc_no = Column(String(11), unique=True, index=True, nullable=False)
    ad = Column(String(100), nullable=False)
    soyad = Column(String(100), nullable=False)
    adres = Column(String(500), nullable=False)
    mahalle = Column(String(100), nullable=True, index=True)
    ilce = Column(String(100), nullable=True, index=True)
    il = Column(String(100), nullable=True, index=True)
    telefon = Column(String(20), nullable=False)
    profil_resmi_url = Column(String(500), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="hasta")
    siparisler = relationship("Siparis", back_populates="hasta", cascade="all, delete-orphan")
    
    @property
    def tam_ad(self):
        return f"{self.ad} {self.soyad}"
    
    def __repr__(self):
        return f"<Hasta(tc_no={self.tc_no}, ad={self.tam_ad})>"











