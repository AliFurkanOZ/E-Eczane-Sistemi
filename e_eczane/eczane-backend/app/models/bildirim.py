from sqlalchemy import Column, String, Text, Boolean, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from app.utils.enums import BildirimTip


class Bildirim(BaseModel):
    """Bildirim modeli"""
    __tablename__ = "bildirimler"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    baslik = Column(String(255), nullable=False)
    mesaj = Column(Text, nullable=False)
    tip = Column(SQLEnum(BildirimTip), nullable=False, index=True)
    okundu = Column(Boolean, default=False, nullable=False, index=True)
    
    # Link (opsiyonel - bildirime tıklandığında gidilecek sayfa)
    link = Column(String(500), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="bildirimler")
    
    def __repr__(self):
        return f"<Bildirim(user_id={self.user_id}, baslik={self.baslik}, okundu={self.okundu})>"







