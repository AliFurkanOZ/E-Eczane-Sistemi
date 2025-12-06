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
    
    def __repr__(self):
        return f"<Stok(eczane_id={self.eczane_id}, ilac_id={self.ilac_id}, miktar={self.miktar})>"

