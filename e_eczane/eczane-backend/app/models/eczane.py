from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from app.utils.enums import OnayDurumu


class Eczane(BaseModel):
    """Eczane modeli"""
    __tablename__ = "eczaneler"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    sicil_no = Column(String(50), unique=True, index=True, nullable=False)
    eczane_adi = Column(String(200), nullable=False)
    adres = Column(String(500), nullable=False)
    telefon = Column(String(20), nullable=False)
    mahalle = Column(String(100), nullable=False, index=True)  # Konum bazlı sıralama için
    ilce = Column(String(100), nullable=True, index=True)  # İlçe bilgisi
    il = Column(String(100), nullable=True, index=True)  # İl bilgisi
    
    # Eczacı bilgileri
    eczaci_adi = Column(String(100), nullable=False)
    eczaci_soyadi = Column(String(100), nullable=False)
    eczaci_diploma_no = Column(String(50), nullable=False)
    
    # Banka bilgileri
    banka_hesap_no = Column(String(50), nullable=False)
    iban = Column(String(50), nullable=False)
    
    # Onay durumu
    onay_durumu = Column(
        SQLEnum(OnayDurumu), 
        default=OnayDurumu.BEKLEMEDE, 
        nullable=False, 
        index=True
    )
    onay_notu = Column(String(500), nullable=True)  # Red veya onay notu
    
    # Relationships
    user = relationship("User", back_populates="eczane")
    stoklar = relationship("Stok", back_populates="eczane", cascade="all, delete-orphan")
    siparisler = relationship("Siparis", back_populates="eczane", cascade="all, delete-orphan")
    
    @property
    def eczaci_tam_ad(self):
        return f"Ecz. {self.eczaci_adi} {self.eczaci_soyadi}"
    
    def __repr__(self):
        return f"<Eczane(sicil_no={self.sicil_no}, ad={self.eczane_adi})>"











