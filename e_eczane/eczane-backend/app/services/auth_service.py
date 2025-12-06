from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.hasta import Hasta
from app.models.eczane import Eczane
from app.schemas.auth import UserLogin, Token
from app.schemas.hasta import HastaCreate
from app.schemas.eczane import EczaneCreate
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.utils.enums import UserType, OnayDurumu
from datetime import timedelta
from app.core.config import settings


class AuthService:
    """Authentication servis katmanı"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def login(self, login_data: UserLogin) -> Token:
        """
        Kullanıcı girişi
        
        Args:
            login_data: Login bilgileri (identifier, password, user_type)
        
        Returns:
            Token: Access token ve refresh token
        
        Raises:
            HTTPException: Kullanıcı bulunamadı veya şifre yanlış
        """
        # Kullanıcıyı bul
        user = self._find_user_by_identifier(login_data.identifier, login_data.user_type)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Kullanıcı adı veya şifre hatalı"
            )
        
        # Şifre kontrolü
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Kullanıcı adı veya şifre hatalı"
            )
        
        # Kullanıcı aktif mi?
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Hesabınız pasif durumda"
            )
        
        # Eczane ise onay durumu kontrol et
        if user.user_type == UserType.ECZANE:
            eczane = self.db.query(Eczane).filter(Eczane.user_id == user.id).first()
            if eczane.onay_durumu != OnayDurumu.ONAYLANDI:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Eczane kaydınız henüz onaylanmadı. Durum: {eczane.onay_durumu.value}"
                )
        
        # Token oluştur
        token_data = {
            "user_id": str(user.id),
            "email": user.email,
            "user_type": user.user_type.value
        }
        
        access_token = create_access_token(
            token_data,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        refresh_token = create_refresh_token(token_data)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user_type=user.user_type,
            user_id=str(user.id)
        )
    
    def register_hasta(self, hasta_data: HastaCreate) -> Hasta:
        """
        Hasta kaydı
        
        Args:
            hasta_data: Hasta bilgileri
        
        Returns:
            Hasta: Oluşturulan hasta kaydı
        
        Raises:
            HTTPException: Email veya TC No zaten kullanımda
        """
        # Email kontrolü
        existing_user = self.db.query(User).filter(User.email == hasta_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu email adresi zaten kullanılıyor"
            )
        
        # TC No kontrolü
        existing_hasta = self.db.query(Hasta).filter(Hasta.tc_no == hasta_data.tc_no).first()
        if existing_hasta:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu TC Kimlik No zaten kayıtlı"
            )
        
        # User oluştur
        user = User(
            email=hasta_data.email,
            password_hash=get_password_hash(hasta_data.password),
            user_type=UserType.HASTA,
            is_active=True
        )
        self.db.add(user)
        self.db.flush()  # ID'yi al
        
        # Hasta oluştur
        hasta = Hasta(
            user_id=user.id,
            tc_no=hasta_data.tc_no,
            ad=hasta_data.ad,
            soyad=hasta_data.soyad,
            adres=hasta_data.adres,
            telefon=hasta_data.telefon,
            profil_resmi_url=hasta_data.profil_resmi_url
        )
        self.db.add(hasta)
        self.db.commit()
        self.db.refresh(hasta)
        
        return hasta
    
    def register_eczane(self, eczane_data: EczaneCreate) -> Eczane:
        """
        Eczane kaydı (Onay beklemede olarak)
        
        Args:
            eczane_data: Eczane bilgileri
        
        Returns:
            Eczane: Oluşturulan eczane kaydı
        
        Raises:
            HTTPException: Email veya Sicil No zaten kullanımda
        """
        # Email kontrolü
        existing_user = self.db.query(User).filter(User.email == eczane_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu email adresi zaten kullanılıyor"
            )
        
        # Sicil No kontrolü
        existing_eczane = self.db.query(Eczane).filter(Eczane.sicil_no == eczane_data.sicil_no).first()
        if existing_eczane:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu sicil numarası zaten kayıtlı"
            )
        
        # User oluştur
        user = User(
            email=eczane_data.email,
            password_hash=get_password_hash(eczane_data.password),
            user_type=UserType.ECZANE,
            is_active=True
        )
        self.db.add(user)
        self.db.flush()
        
        # Eczane oluştur (BEKLEMEDE durumunda)
        eczane = Eczane(
            user_id=user.id,
            sicil_no=eczane_data.sicil_no,
            eczane_adi=eczane_data.eczane_adi,
            adres=eczane_data.adres,
            telefon=eczane_data.telefon,
            mahalle=eczane_data.mahalle,
            eczaci_adi=eczane_data.eczaci_adi,
            eczaci_soyadi=eczane_data.eczaci_soyadi,
            eczaci_diploma_no=eczane_data.eczaci_diploma_no,
            banka_hesap_no=eczane_data.banka_hesap_no,
            iban=eczane_data.iban,
            onay_durumu=OnayDurumu.BEKLEMEDE
        )
        self.db.add(eczane)
        self.db.commit()
        self.db.refresh(eczane)
        
        return eczane
    
    def _find_user_by_identifier(self, identifier: str, user_type: UserType) -> Optional[User]:
        """
        Identifier'a göre kullanıcı bul (Email, TC No veya Sicil No)
        
        Args:
            identifier: Email, TC No veya Sicil No
            user_type: Kullanıcı tipi
        
        Returns:
            User: Bulunan kullanıcı veya None
        """
        # Önce email ile dene
        user = self.db.query(User).filter(
            User.email == identifier,
            User.user_type == user_type
        ).first()
        
        if user:
            return user
        
        # TC No ile dene (Hasta ise)
        if user_type == UserType.HASTA:
            hasta = self.db.query(Hasta).filter(Hasta.tc_no == identifier).first()
            if hasta:
                return self.db.query(User).filter(User.id == hasta.user_id).first()
        
        # Sicil No ile dene (Eczane ise)
        if user_type == UserType.ECZANE:
            eczane = self.db.query(Eczane).filter(Eczane.sicil_no == identifier).first()
            if eczane:
                return self.db.query(User).filter(User.id == eczane.user_id).first()
        
        return None
