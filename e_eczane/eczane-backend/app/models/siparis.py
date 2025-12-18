from sqlalchemy import Column, String, Numeric, Enum as SQLEnum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from app.utils.enums import SiparisDurum, OdemeDurum
import uuid
from datetime import datetime


def generate_siparis_no():
    """Benzersiz sipariş numarası üret - UUID tabanlı çakışma önleyici"""
    # Timestamp (YYMMDDHHMMSS) + UUID'nin son 4 karakteri
    timestamp = datetime.now().strftime("%y%m%d%H%M%S")
    unique_suffix = uuid.uuid4().hex[:4].upper()
    return f"SIP{timestamp}{unique_suffix}"


class Siparis(BaseModel):
    """Sipariş modeli"""
    __tablename__ = "siparisler"
    
    siparis_no = Column(String(50), unique=True, index=True, nullable=False, default=generate_siparis_no)
    
    # İlişkiler
    hasta_id = Column(UUID(as_uuid=True), ForeignKey("hastalar.id", ondelete="CASCADE"), nullable=False, index=True)
    eczane_id = Column(UUID(as_uuid=True), ForeignKey("eczaneler.id", ondelete="CASCADE"), nullable=False, index=True)
    recete_id = Column(UUID(as_uuid=True), ForeignKey("receteler.id", ondelete="SET NULL"), nullable=True)
    
    # Sipariş bilgileri
    toplam_tutar = Column(Numeric(10, 2), nullable=False)
    durum = Column(SQLEnum(SiparisDurum), default=SiparisDurum.BEKLEMEDE, nullable=False, index=True)
    odeme_durumu = Column(SQLEnum(OdemeDurum), default=OdemeDurum.BEKLEMEDE, nullable=False)
    
    # Teslimat bilgileri
    teslimat_adresi = Column(Text, nullable=False)
    siparis_notu = Column(Text, nullable=True)
    
    # İptal bilgileri
    iptal_nedeni = Column(Text, nullable=True)
    
    # Relationships
    hasta = relationship("Hasta", back_populates="siparisler")
    eczane = relationship("Eczane", back_populates="siparisler")
    recete = relationship("Recete", back_populates="siparisler")
    detaylar = relationship("SiparisDetay", back_populates="siparis", cascade="all, delete-orphan")
    durum_gecmisi = relationship("SiparisDurumGecmisi", back_populates="siparis", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Siparis(siparis_no={self.siparis_no}, durum={self.durum})>"




class SiparisDetay(BaseModel):
    """Sipariş detay modeli (Sepetteki ürünler)"""
    __tablename__ = "siparis_detaylari"
    
    siparis_id = Column(UUID(as_uuid=True), ForeignKey("siparisler.id", ondelete="CASCADE"), nullable=False, index=True)
    ilac_id = Column(UUID(as_uuid=True), ForeignKey("ilaclar.id", ondelete="RESTRICT"), nullable=False)
    
    miktar = Column(Integer, nullable=False)
    birim_fiyat = Column(Numeric(10, 2), nullable=False)
    ara_toplam = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    siparis = relationship("Siparis", back_populates="detaylar")
    ilac = relationship("Ilac", back_populates="siparis_detaylari")
    
    def __repr__(self):
        return f"<SiparisDetay(siparis_id={self.siparis_id}, ilac_id={self.ilac_id}, miktar={self.miktar})>"




class SiparisDurumGecmisi(BaseModel):
    """Sipariş durum değişiklik geçmişi"""
    __tablename__ = "siparis_durum_gecmisi"
    
    siparis_id = Column(UUID(as_uuid=True), ForeignKey("siparisler.id", ondelete="CASCADE"), nullable=False, index=True)
    eski_durum = Column(String(50), nullable=True)
    yeni_durum = Column(String(50), nullable=False)
    aciklama = Column(Text, nullable=True)
    degistiren_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    siparis = relationship("Siparis", back_populates="durum_gecmisi")
    degistiren = relationship("User")
    
    def __repr__(self):
        return f"<SiparisDurumGecmisi(siparis_id={self.siparis_id}, {self.eski_durum} -> {self.yeni_durum})>"

