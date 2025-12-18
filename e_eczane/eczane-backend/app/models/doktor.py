from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Doktor(BaseModel):
    """Doktor modeli"""
    __tablename__ = "doktorlar"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    diploma_no = Column(String(50), unique=True, index=True, nullable=False)
    uzmanlik = Column(String(100), nullable=True)  # Uzmanlık alanı
    hastane = Column(String(200), nullable=True)   # Çalıştığı hastane
    ad = Column(String(100), nullable=False)
    soyad = Column(String(100), nullable=False)
    telefon = Column(String(20), nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="doktor")
    
    @property
    def tam_ad(self):
        """Tam ad döndür"""
        return f"Dr. {self.ad} {self.soyad}"
    
    def __repr__(self):
        return f"<Doktor(diploma_no={self.diploma_no}, ad={self.ad} {self.soyad})>"
