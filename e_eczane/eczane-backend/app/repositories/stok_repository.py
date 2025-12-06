from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models.stok import Stok
from app.models.ilac import Ilac
from app.schemas.stok import StokCreate, StokUpdate


class StokRepository:
    """Stok repository"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, stok_id: str) -> Optional[Stok]:
        """ID'ye göre stok getir"""
        return self.db.query(Stok).filter(Stok.id == stok_id).first()
    
    def get_by_eczane(self, eczane_id: str) -> List[Stok]:
        """Eczaneye ait tüm stokları getir"""
        return self.db.query(Stok).options(
            joinedload(Stok.ilac)
        ).filter(Stok.eczane_id == eczane_id).all()
    
    def get_by_eczane_and_ilac(self, eczane_id: str, ilac_id: str) -> Optional[Stok]:
        """Belirli eczane ve ilaç için stok getir"""
        return self.db.query(Stok).filter(
            Stok.eczane_id == eczane_id,
            Stok.ilac_id == ilac_id
        ).first()
    
    def get_dusuk_stoklar(self, eczane_id: str) -> List[Stok]:
        """Düşük stok uyarısı veren ilaçları getir"""
        return self.db.query(Stok).options(
            joinedload(Stok.ilac)
        ).filter(
            Stok.eczane_id == eczane_id,
            Stok.miktar <= Stok.min_stok
        ).all()
    
    def create(self, eczane_id: str, stok_data: StokCreate) -> Stok:
        """Yeni stok kaydı oluştur"""
        # Zaten var mı kontrol et
        existing = self.get_by_eczane_and_ilac(eczane_id, stok_data.ilac_id)
        if existing:
            # Varsa miktarı artır
            existing.miktar += stok_data.miktar
            self.db.commit()
            self.db.refresh(existing)
            return existing
        
        # Yoksa yeni oluştur
        stok = Stok(
            eczane_id=eczane_id,
            ilac_id=stok_data.ilac_id,
            miktar=stok_data.miktar,
            min_stok=stok_data.min_stok
        )
        self.db.add(stok)
        self.db.commit()
        self.db.refresh(stok)
        return stok
    
    def update(self, stok_id: str, stok_data: StokUpdate) -> Optional[Stok]:
        """Stok güncelle"""
        stok = self.get_by_id(stok_id)
        if not stok:
            return None
        
        update_data = stok_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(stok, field, value)
        
        self.db.commit()
        self.db.refresh(stok)
        return stok
    
    def increase_stock(self, eczane_id: str, ilac_id: str, miktar: int) -> Optional[Stok]:
        """Stok artır"""
        stok = self.get_by_eczane_and_ilac(eczane_id, ilac_id)
        if stok:
            stok.miktar += miktar
            self.db.commit()
            self.db.refresh(stok)
        return stok
    
    def decrease_stock(self, eczane_id: str, ilac_id: str, miktar: int) -> Optional[Stok]:
        """Stok azalt"""
        stok = self.get_by_eczane_and_ilac(eczane_id, ilac_id)
        if stok:
            stok.miktar = max(0, stok.miktar - miktar)
            self.db.commit()
            self.db.refresh(stok)
        return stok
    
    def delete(self, stok_id: str) -> bool:
        """Stok kaydını sil"""
        stok = self.get_by_id(stok_id)
        if stok:
            self.db.delete(stok)
            self.db.commit()
            return True
        return False
