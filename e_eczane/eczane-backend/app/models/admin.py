from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Admin(BaseModel):
    """Admin modeli"""
    __tablename__ = "adminler"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    ad = Column(String(100), nullable=False)
    soyad = Column(String(100), nullable=False)
    telefon = Column(String(20), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="admin")
    
    @property
    def tam_ad(self):
        return f"{self.ad} {self.soyad}"
    
    def __repr__(self):
        return f"<Admin(ad={self.tam_ad})>"











