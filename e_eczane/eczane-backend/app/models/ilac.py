from sqlalchemy import Column, String, Numeric, Boolean, Enum as SQLEnum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from app.utils.enums import IlacKategori


class Ilac(BaseModel):
    """İlaç modeli"""
    __tablename__ = "ilaclar"
    
    barkod = Column(String(50), unique=True, index=True, nullable=False)
    ad = Column(String(200), nullable=False, index=True)
    kategori = Column(SQLEnum(IlacKategori), nullable=False, index=True)
    kullanim_talimati = Column(Text, nullable=False)
    fiyat = Column(Numeric(10, 2), nullable=False)
    receteli = Column(Boolean, default=False, nullable=False, index=True)
    aktif = Column(Boolean, default=True, nullable=False)
    
    # Ek bilgiler
    etken_madde = Column(String(200), nullable=True)
    firma = Column(String(200), nullable=True)
    prospektus_url = Column(String(500), nullable=True)
    
    # Relationships
    muadiller = relationship(
        "MuadilIlac",
        foreign_keys="MuadilIlac.ilac_id",
        back_populates="ilac",
        cascade="all, delete-orphan"
    )
    
    muadil_oldugu = relationship(
        "MuadilIlac",
        foreign_keys="MuadilIlac.muadil_ilac_id",
        back_populates="muadil_ilac",
        cascade="all, delete-orphan"
    )
    
    stoklar = relationship("Stok", back_populates="ilac", cascade="all, delete-orphan")
    recete_ilaclar = relationship("ReceteIlac", back_populates="ilac", cascade="all, delete-orphan")
    siparis_detaylari = relationship("SiparisDetay", back_populates="ilac")
    
    def __repr__(self):
        return f"<Ilac(barkod={self.barkod}, ad={self.ad})>"


class MuadilIlac(BaseModel):
    """Muadil ilaç ilişki modeli"""
    __tablename__ = "muadil_ilaclar"
    
    ilac_id = Column(UUID(as_uuid=True), ForeignKey("ilaclar.id", ondelete="CASCADE"), nullable=False)
    muadil_ilac_id = Column(UUID(as_uuid=True), ForeignKey("ilaclar.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    ilac = relationship("Ilac", foreign_keys=[ilac_id], back_populates="muadiller")
    muadil_ilac = relationship("Ilac", foreign_keys=[muadil_ilac_id], back_populates="muadil_oldugu")
    
    def __repr__(self):
        return f"<MuadilIlac(ilac_id={self.ilac_id}, muadil_id={self.muadil_ilac_id})>"

