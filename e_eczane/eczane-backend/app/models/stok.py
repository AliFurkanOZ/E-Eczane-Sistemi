from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Stok(BaseModel):
    """Eczane stok modeli"""
    __tablename__ = "stoklar"
    
    eczane_id = Column(UUID(as_uuid=True), ForeignKey("eczaneler.id", ondelete="CASCADE"), nullable=False, index=True)
    ilac_id = Column(UUID(as_uuid=True), ForeignKey("ilaclar.id", ondelete="CASCADE"), nullable=False, index=True)
    miktar = Column(Integer, default=0, nullable=False)
    min_stok = Column(Integer, default=10, nullable=False)  # Minimum stok uyarısı için
    
    # Relationships
    eczane = relationship("Eczane", back_populates="stoklar")
    ilac = relationship("Ilac", back_populates="stoklar")
    
    # Bir eczanede bir ilaç sadece bir kez olabilir
    __table_args__ = (
        UniqueConstraint('eczane_id', 'ilac_id', name='uq_eczane_ilac'),
    )
    
    @property
    def stok_durumu(self):
        """Stok durumu kontrolü"""
        if self.miktar == 0:
            return "tukendi"
        elif self.miktar <= self.min_stok:
            return "azaliyor"
        return "yeterli"
    
    @property
    def ilac_adi(self):
        """İlaç adını döndür"""
        return self.ilac.ad if self.ilac else "Bilinmiyor"
    
    @property
    def ilac_barkod(self):
        """İlaç barkodunu döndür"""
        return self.ilac.barkod if self.ilac else ""
    
    @property
    def ilac_fiyat(self):
        """İlaç fiyatını döndür"""
        return self.ilac.fiyat if self.ilac else 0
    
    @property
    def ilac_kategori(self):
        """İlaç kategorisini döndür"""
        return self.ilac.kategori.value if self.ilac and self.ilac.kategori else ""
    
    @property
    def ilac_kullanim_talimati(self):
        """İlaç kullanım talimatını döndür"""
        return self.ilac.kullanim_talimati if self.ilac else ""
    
    @property
    def ilac_etken_madde(self):
        """İlaç etken maddesini döndür"""
        return self.ilac.etken_madde if self.ilac else None
    
    @property
    def ilac_firma(self):
        """İlaç firmasını döndür"""
        return self.ilac.firma if self.ilac else None
    
    @property
    def ilac_receteli(self):
        """İlaç reçeteli mi döndür"""
        return self.ilac.receteli if self.ilac else False
    
    @property
    def ilac_prospektus_url(self):
        """İlaç prospektüs URL'sini döndür"""
        return self.ilac.prospektus_url if self.ilac else None
    
    def __repr__(self):
        return f"<Stok(eczane_id={self.eczane_id}, ilac_id={self.ilac_id}, miktar={self.miktar})>"


