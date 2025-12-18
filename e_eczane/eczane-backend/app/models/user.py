from sqlalchemy import Column, String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.utils.enums import UserType


class User(BaseModel):
    """Base User modeli - Tüm kullanıcı tipleri için"""
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    user_type = Column(SQLEnum(UserType), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Relationships - polymorphic
    hasta = relationship("Hasta", back_populates="user", uselist=False, cascade="all, delete-orphan")
    eczane = relationship("Eczane", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin = relationship("Admin", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doktor = relationship("Doktor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # Bildirimler
    bildirimler = relationship("Bildirim", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, type={self.user_type})>"











