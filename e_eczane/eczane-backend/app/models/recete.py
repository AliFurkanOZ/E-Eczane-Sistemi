from sqlalchemy import Column, String, Date, Enum as SQLEnum, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from enum import Enum


class ReceteDurum(str, Enum):
    AKTIF = "aktif"
    KULLANILDI = "kullanildi"
    IPTAL = "iptal"


class Recete(BaseModel):
    """Reçete modeli (Fake - Simülasyon)"""
    __tablename__ = "receteler"
    
    recete_no = Column(String(50), unique=True, index=True, nullable=False)
    tc_no = Column(String(11), index=True, nullable=False)
    tarih = Column(Date, nullable=False)
    durum = Column(SQLEnum(ReceteDurum), default=ReceteDurum.AKTIF, nullable=False)
    doktor_adi = Column(String(200), nullable=True)
    hastane = Column(String(200), nullable=True)
    
    # Relationships
    ilaclar = relationship("ReceteIlac", back_populates="recete", cascade="all, delete-orphan")
    siparisler = relationship("Siparis", back_populates="recete")
    
    def __repr__(self):
        return f"<Recete(recete_no={self.recete_no}, tc_no={self.tc_no})>"


class ReceteIlac(BaseModel):
    """Reçete-İlaç ilişki modeli"""
    __tablename__ = "recete_ilaclar"
    
    recete_id = Column(UUID(as_uuid=True), ForeignKey("receteler.id", ondelete="CASCADE"), nullable=False)
    ilac_id = Column(UUID(as_uuid=True), ForeignKey("ilaclar.id", ondelete="CASCADE"), nullable=False)
    miktar = Column(Integer, nullable=False)
    kullanim_suresi = Column(String(100), nullable=True)  # "10 gün", "1 ay" gibi
    
    # Relationships
    recete = relationship("Recete", back_populates="ilaclar")
    ilac = relationship("Ilac", back_populates="recete_ilaclar")
    
    def __repr__(self):
        return f"<ReceteIlac(recete_id={self.recete_id}, ilac_id={self.ilac_id}, miktar={self.miktar})>"

