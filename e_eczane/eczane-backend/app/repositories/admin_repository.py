from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, cast, Date
from datetime import date, datetime, timedelta
from app.models.admin import Admin
from app.models.user import User
from app.models.eczane import Eczane
from app.models.hasta import Hasta
from app.models.siparis import Siparis
from app.utils.enums import OnayDurumu, SiparisDurum, OdemeDurum


class AdminRepository:
    """Admin repository"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_user_id(self, user_id: str) -> Optional[Admin]:
        """User ID'ye göre admin getir"""
        return self.db.query(Admin).filter(Admin.user_id == user_id).first()
    
    def get_bekleyen_eczaneler(self) -> List[Eczane]:
        """Onay bekleyen eczaneleri getir"""
        return self.db.query(Eczane).options(
            joinedload(Eczane.user)
        ).filter(
            Eczane.onay_durumu == OnayDurumu.BEKLEMEDE
        ).order_by(Eczane.created_at.desc()).all()
    
    def get_all_eczaneler(self, onay_durumu: Optional[OnayDurumu] = None) -> List[Eczane]:
        """Tüm eczaneleri getir (filtre ile)"""
        query = self.db.query(Eczane).options(joinedload(Eczane.user))
        
        if onay_durumu:
            query = query.filter(Eczane.onay_durumu == onay_durumu)
        
        return query.order_by(Eczane.created_at.desc()).all()
    
    def get_all_hastalar(self, is_active: Optional[bool] = None) -> List[Hasta]:
        """Tüm hastaları getir (filtre ile)"""
        query = self.db.query(Hasta).options(joinedload(Hasta.user))
        
        if is_active is not None:
            query = query.join(Hasta.user).filter(User.is_active == is_active)
        
        return query.order_by(Hasta.created_at.desc()).all()
    
    def get_all_siparisler(
        self,
        durum: Optional[SiparisDurum] = None,
        baslangic_tarih: Optional[date] = None,
        bitis_tarih: Optional[date] = None
    ) -> List[Siparis]:
        """Tüm siparişleri getir (filtre ile)"""
        query = self.db.query(Siparis).options(
            joinedload(Siparis.hasta),
            joinedload(Siparis.eczane)
        )
        
        if durum:
            query = query.filter(Siparis.durum == durum)
        
        if baslangic_tarih:
            query = query.filter(cast(Siparis.created_at, Date) >= baslangic_tarih)
        
        if bitis_tarih:
            query = query.filter(cast(Siparis.created_at, Date) <= bitis_tarih)
        
        return query.order_by(Siparis.created_at.desc()).all()
    
    def get_dashboard_stats(self) -> dict:
        """Dashboard istatistiklerini hesapla"""
        bugun = date.today()
        
        # Toplam sayılar
        toplam_hasta = self.db.query(func.count(Hasta.id)).scalar()
        toplam_eczane = self.db.query(func.count(Eczane.id)).scalar()
        
        # Aktif ve bekleyen eczaneler
        aktif_eczane = self.db.query(func.count(Eczane.id)).filter(
            Eczane.onay_durumu == OnayDurumu.ONAYLANDI
        ).scalar()
        
        bekleyen_eczane = self.db.query(func.count(Eczane.id)).filter(
            Eczane.onay_durumu == OnayDurumu.BEKLEMEDE
        ).scalar()
        
        # Sipariş sayıları
        toplam_siparis = self.db.query(func.count(Siparis.id)).scalar()
        
        bugunku_siparis = self.db.query(func.count(Siparis.id)).filter(
            cast(Siparis.created_at, Date) == bugun
        ).scalar()
        
        # Ciro hesaplamaları (sadece teslim edilmiş siparişler)
        toplam_ciro = self.db.query(func.sum(Siparis.toplam_tutar)).filter(
            Siparis.durum == SiparisDurum.TESLIM_EDILDI
        ).scalar() or 0
        
        bugunku_ciro = self.db.query(func.sum(Siparis.toplam_tutar)).filter(
            and_(
                Siparis.durum == SiparisDurum.TESLIM_EDILDI,
                cast(Siparis.created_at, Date) == bugun
            )
        ).scalar() or 0
        
        return {
            "toplam_hasta": toplam_hasta or 0,
            "toplam_eczane": toplam_eczane or 0,
            "aktif_eczane": aktif_eczane or 0,
            "bekleyen_eczane": bekleyen_eczane or 0,
            "toplam_siparis": toplam_siparis or 0,
            "bugunku_siparis": bugunku_siparis or 0,
            "toplam_ciro": float(toplam_ciro),
            "bugunku_ciro": float(bugunku_ciro)
        }
    
    def get_siparis_stats(self) -> dict:
        """Sipariş durum istatistikleri"""
        stats = {}
        
        for durum in SiparisDurum:
            count = self.db.query(func.count(Siparis.id)).filter(
                Siparis.durum == durum
            ).scalar()
            stats[durum.value] = count or 0
        
        return stats
