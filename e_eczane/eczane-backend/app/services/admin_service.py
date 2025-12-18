from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.eczane import Eczane
from app.models.hasta import Hasta
from app.models.admin import Admin
from app.models.doktor import Doktor
from app.models.bildirim import Bildirim
from app.schemas.admin import AdminCreate, EczaneOnayAction, KullaniciYonetim, DoktorDuzenle
from app.schemas.doktor import DoktorCreate
from app.repositories.admin_repository import AdminRepository
from app.utils.enums import OnayDurumu, UserType, BildirimTip
from app.core.security import get_password_hash


class AdminService:
    """Admin servis katmanı"""
    
    def __init__(self, db: Session):
        self.db = db
        self.admin_repo = AdminRepository(db)
    
    def create_admin(self, admin_data: AdminCreate) -> Admin:
        """
        Yeni admin oluştur
        
        Args:
            admin_data: Admin bilgileri
        
        Returns:
            Admin: Oluşturulan admin
        """
        # Email kontrolü
        existing_user = self.db.query(User).filter(User.email == admin_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu email adresi zaten kullanılıyor"
            )
        
        # User oluştur
        user = User(
            email=admin_data.email,
            password_hash=get_password_hash(admin_data.password),
            user_type=UserType.ADMIN,
            is_active=True
        )
        self.db.add(user)
        self.db.flush()
        
        # Admin oluştur
        admin = Admin(
            user_id=user.id,
            ad=admin_data.ad,
            soyad=admin_data.soyad,
            telefon=admin_data.telefon
        )
        self.db.add(admin)
        self.db.commit()
        self.db.refresh(admin)
        
        return admin
    
    def onayla_eczane(
        self,
        eczane_id: str,
        action_data: EczaneOnayAction
    ) -> Eczane:
        """
        Eczane kaydını onayla
        
        Args:
            eczane_id: Eczane ID
            action_data: Onay notu
        
        Returns:
            Eczane: Onaylanan eczane
        """
        eczane = self.db.query(Eczane).filter(Eczane.id == eczane_id).first()
        
        if not eczane:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Eczane bulunamadı"
            )
        
        if eczane.onay_durumu != OnayDurumu.BEKLEMEDE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bu eczane zaten {eczane.onay_durumu.value} durumunda"
            )
        
        # Eczane onayını güncelle
        eczane.onay_durumu = OnayDurumu.ONAYLANDI
        eczane.onay_notu = action_data.onay_notu or "Eczane kaydınız onaylandı"
        
        # Eczaneye bildirim gönder
        bildirim = Bildirim(
            user_id=eczane.user_id,
            baslik="Eczane Kaydı Onaylandı",
            mesaj=f"Tebrikler! {eczane.eczane_adi} eczane kaydınız onaylandı. Artık sistemi kullanabilirsiniz.",
            tip=BildirimTip.SISTEM
        )
        self.db.add(bildirim)
        
        self.db.commit()
        self.db.refresh(eczane)
        
        return eczane
    
    def reddet_eczane(
        self,
        eczane_id: str,
        action_data: EczaneOnayAction
    ) -> Eczane:
        """
        Eczane kaydını reddet
        
        Args:
            eczane_id: Eczane ID
            action_data: Red nedeni
        
        Returns:
            Eczane: Reddedilen eczane
        """
        eczane = self.db.query(Eczane).filter(Eczane.id == eczane_id).first()
        
        if not eczane:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Eczane bulunamadı"
            )
        
        if eczane.onay_durumu != OnayDurumu.BEKLEMEDE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bu eczane zaten {eczane.onay_durumu.value} durumunda"
            )
        
        if not action_data.onay_notu:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Red nedeni belirtilmelidir"
            )
        
        # Eczane onayını güncelle
        eczane.onay_durumu = OnayDurumu.REDDEDILDI
        eczane.onay_notu = action_data.onay_notu
        
        # Eczaneye bildirim gönder
        bildirim = Bildirim(
            user_id=eczane.user_id,
            baslik="Eczane Kaydı Reddedildi",
            mesaj=f"Maalesef {eczane.eczane_adi} eczane kaydınız reddedildi. Red nedeni: {action_data.onay_notu}",
            tip=BildirimTip.SISTEM
        )
        self.db.add(bildirim)
        
        self.db.commit()
        self.db.refresh(eczane)
        
        return eczane
    
    def update_kullanici_durum(
        self,
        user_id: str,
        yonetim_data: KullaniciYonetim
    ) -> User:
        """
        Kullanıcı durumunu güncelle (aktif/pasif)
        
        Args:
            user_id: User ID
            yonetim_data: Durum ve neden
        
        Returns:
            User: Güncellenmiş kullanıcı
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kullanıcı bulunamadı"
            )
        
        if user.user_type == UserType.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin kullanıcıları pasif yapılamaz"
            )
        
        # Durumu güncelle
        user.is_active = yonetim_data.is_active
        
        # Bildirim gönder
        if not yonetim_data.is_active:
            mesaj = f"Hesabınız pasif duruma alınmıştır. Neden: {yonetim_data.neden or 'Belirtilmedi'}"
            baslik = "Hesap Pasif Yapıldı"
        else:
            mesaj = "Hesabınız tekrar aktif edilmiştir."
            baslik = "Hesap Aktif Edildi"
        
        bildirim = Bildirim(
            user_id=user.id,
            baslik=baslik,
            mesaj=mesaj,
            tip=BildirimTip.SISTEM
        )
        self.db.add(bildirim)
        
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def create_doktor(self, doktor_data: DoktorCreate) -> Doktor:
        """
        Admin tarafından yeni doktor oluştur
        """
        existing_user = self.db.query(User).filter(User.email == doktor_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu email adresi zaten kullanılıyor"
            )
        
        existing_doktor = self.db.query(Doktor).filter(Doktor.diploma_no == doktor_data.diploma_no).first()
        if existing_doktor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu diploma numarası zaten kayıtlı"
            )
        
        user = User(
            email=doktor_data.email,
            password_hash=get_password_hash(doktor_data.password),
            user_type=UserType.DOKTOR,
            is_active=True
        )
        self.db.add(user)
        self.db.flush()
        
        doktor = Doktor(
            user_id=user.id,
            diploma_no=doktor_data.diploma_no,
            ad=doktor_data.ad,
            soyad=doktor_data.soyad,
            uzmanlik=doktor_data.uzmanlik,
            hastane=doktor_data.hastane,
            telefon=doktor_data.telefon
        )
        self.db.add(doktor)
        self.db.commit()
        self.db.refresh(doktor)
        
        return doktor
    
    def update_doktor(self, doktor_id: str, doktor_data: DoktorDuzenle) -> Doktor:
        """
        Doktor bilgilerini güncelle
        """
        doktor = self.admin_repo.get_doktor_by_id(doktor_id)
        
        if not doktor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doktor bulunamadı"
            )
        
        update_data = doktor_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(doktor, field, value)
        
        self.db.commit()
        self.db.refresh(doktor)
        
        return doktor
