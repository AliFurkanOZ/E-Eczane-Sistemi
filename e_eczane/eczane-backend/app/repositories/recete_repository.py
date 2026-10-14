from sqlalchemy.orm import Session
from app.models.recete import Recete, ReceteIlac
from app.models.ilac import Ilac
from typing import List, Optional
from datetime import datetime


class ReceteRepository:
    """Reçete repository katmanı"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_tc_no(self, tc_no: str) -> List[Recete]:
        """TC No'ya göre reçeteleri getir"""
        return self.db.query(Recete).filter(
            Recete.tc_no == tc_no
        ).order_by(Recete.tarih.desc()).all()
    
    def get_hasta_receteleri(self, hasta_id: str) -> List[Recete]:
        """Hastanın reçetelerini getir"""
        return self.db.query(Recete).filter(
            Recete.hasta_id == hasta_id
        ).order_by(Recete.created_at.desc()).all()
    
    def get_recete_with_details(self, recete_id: str) -> Optional[Recete]:
        """Reçete detaylarını getir (ilaçlar dahil)"""
        return self.db.query(Recete).filter(
            Recete.id == recete_id
        ).first()
    
    def create_recete(self, recete_data: dict) -> Recete:
        """Yeni reçete oluştur"""
        recete = Recete(**recete_data)
        self.db.add(recete)
        self.db.flush()
        return recete
    
    def add_ilac_to_recete(self, recete_id: str, ilac_data: dict) -> ReceteIlac:
        """Reçeteye ilaç ekle"""
        recete_ilac = ReceteIlac(
            recete_id=recete_id,
            **ilac_data
        )
        self.db.add(recete_ilac)
        return recete_ilac
    
    def get_ilac_by_id(self, ilac_id: str) -> Optional[Ilac]:
        """İlaç bilgisini getir"""
        return self.db.query(Ilac).filter(Ilac.id == ilac_id).first()
    
    def get_recete_by_id(self, recete_id: str) -> Optional[Recete]:
        """Reçete bilgisini getir"""
        return self.db.query(Recete).filter(Recete.id == recete_id).first()
    
    def update_recete_durum(self, recete_id: str, durum: str) -> Optional[Recete]:
        """Reçete durumunu güncelle"""
        recete = self.db.query(Recete).filter(Recete.id == recete_id).first()
        if recete:
            recete.durum = durum
            recete.updated_at = datetime.utcnow()
        return recete