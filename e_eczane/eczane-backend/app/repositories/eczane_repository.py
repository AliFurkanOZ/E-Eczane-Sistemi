from uuid import UUID
from typing import List, Optional, Tuple, Dict
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models.eczane import Eczane
from app.models.stok import Stok
from app.utils.enums import OnayDurumu


class EczaneRepository:
    """Eczane repository - Location-based pharmacy queries"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, eczane_id: UUID) -> Optional[Eczane]:
        """ID'ye göre eczane getir"""
        return self.db.query(Eczane).filter(
            Eczane.id == eczane_id,
            Eczane.onay_durumu == OnayDurumu.ONAYLANDI
        ).first()
    
    def get_by_user_id(self, user_id: UUID) -> Optional[Eczane]:
        """User ID'ye göre eczane getir"""
        return self.db.query(Eczane).filter(Eczane.user_id == user_id).first()
    
    def get_aktif_eczaneler(self) -> List[Eczane]:
        """Onaylı ve aktif eczaneleri getir"""
        return self.db.query(Eczane).join(Eczane.user).filter(
            Eczane.onay_durumu == OnayDurumu.ONAYLANDI,
            Eczane.user.has(is_active=True)
        ).all()
    
    def get_by_mahalle(self, mahalle: str) -> List[Eczane]:
        """Mahalleye göre eczaneleri getir"""
        return self.db.query(Eczane).join(Eczane.user).filter(
            Eczane.mahalle == mahalle,
            Eczane.onay_durumu == OnayDurumu.ONAYLANDI,
            Eczane.user.has(is_active=True)
        ).all()
    
    def find_eczaneler_with_stock(
        self,
        ilac_ids: List[str],
        hasta_mahalle: Optional[str] = None,
        hasta_ilce: Optional[str] = None,
        hasta_il: Optional[str] = None
    ) -> List[Tuple[Eczane, Dict]]:
        """
        Belirli ilaçlara sahip eczaneleri bul ve konuma göre sırala
        
        Args:
            ilac_ids: Aranan ilaç ID'leri (string format)
            hasta_mahalle: Hastanın mahallesi
            hasta_ilce: Hastanın ilçesi
            hasta_il: Hastanın ili
        
        Returns:
            List of (Eczane, stok_bilgileri) tuples - konuma göre sıralı
        """
        # Convert string IDs to UUIDs
        uuid_ilac_ids = [UUID(ilac_id) for ilac_id in ilac_ids if ilac_id]
        
        if not uuid_ilac_ids:
            return []
        
        # Stokları olan eczaneleri bul
        stoklar = self.db.query(Stok).filter(
            Stok.ilac_id.in_(uuid_ilac_ids),
            Stok.miktar > 0
        ).all()
        
        # Eczaneleri grupla ve stok bilgilerini topla
        eczane_stok_map = {}
        
        for stok in stoklar:
            if stok.eczane_id not in eczane_stok_map:
                eczane_stok_map[stok.eczane_id] = {}
            
            eczane_stok_map[stok.eczane_id][str(stok.ilac_id)] = {
                "miktar": stok.miktar,
                "stok_durumu": stok.stok_durumu
            }
        
        # Eczane bilgilerini al
        eczane_ids = list(eczane_stok_map.keys())
        eczaneler = self.db.query(Eczane).join(Eczane.user).filter(
            Eczane.id.in_(eczane_ids),
            Eczane.onay_durumu == OnayDurumu.ONAYLANDI,
            Eczane.user.has(is_active=True)
        ).all()
        
        # Eczaneleri konuma göre sırala (mahalle > ilce > il)
        def get_location_priority(eczane: Eczane) -> int:
            """
            Konum önceliği:
            0 = Aynı mahalle (en yakın)
            1 = Farklı mahalle, aynı ilçe
            2 = Farklı ilçe, aynı il
            3 = Farklı il (en uzak)
            """
            if hasta_mahalle and eczane.mahalle == hasta_mahalle:
                return 0
            if hasta_ilce and eczane.ilce and eczane.ilce.lower() == hasta_ilce.lower():
                return 1
            if hasta_il and eczane.il and eczane.il.lower() == hasta_il.lower():
                return 2
            return 3
        
        # Eczaneleri öncelik sırasına göre sırala
        sorted_eczaneler = sorted(eczaneler, key=get_location_priority)
        
        result = []
        for eczane in sorted_eczaneler:
            result.append((eczane, eczane_stok_map[eczane.id]))
        
        return result
    
    def check_stock_availability(
        self,
        eczane_id: UUID,
        ilac_miktar_map: Dict[str, int]
    ) -> Tuple[bool, Dict]:
        """
        Eczanede istenen ilaçların stoğu yeterli mi kontrol et
        
        Args:
            eczane_id: Eczane ID
            ilac_miktar_map: {ilac_id: miktar} dictionary
        
        Returns:
            (tumu_yeterli: bool, eksik_ilaclar: dict)
        """
        eksik_ilaclar = {}
        
        for ilac_id_str, istenen_miktar in ilac_miktar_map.items():
            stok = self.db.query(Stok).filter(
                Stok.eczane_id == eczane_id,
                Stok.ilac_id == UUID(ilac_id_str)
            ).first()
            
            if not stok or stok.miktar < istenen_miktar:
                mevcut_miktar = stok.miktar if stok else 0
                eksik_ilaclar[ilac_id_str] = {
                    "istenen": istenen_miktar,
                    "mevcut": mevcut_miktar,
                    "eksik": istenen_miktar - mevcut_miktar
                }
        
        return len(eksik_ilaclar) == 0, eksik_ilaclar