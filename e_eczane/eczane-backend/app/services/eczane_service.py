from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.eczane import Eczane
from app.models.ilac import Ilac
from app.models.stok import Stok
from app.models.bildirim import Bildirim
from app.schemas.stok import IlacEkle, StokCreate, StokUyari
from app.schemas.eczane import EczaneUpdate
from app.repositories.stok_repository import StokRepository
from app.repositories.ilac_repository import IlacRepository
from app.repositories.eczane_repository import EczaneRepository
from app.utils.enums import IlacKategori, BildirimTip


class EczaneService:
    """Eczane servis katmanı"""
    
    def __init__(self, db: Session):
        self.db = db
        self.stok_repo = StokRepository(db)
        self.ilac_repo = IlacRepository(db)
        self.eczane_repo = EczaneRepository(db)
    
    def add_recetesiz_ilac(self, eczane_id: str, ilac_data: IlacEkle) -> Tuple[Ilac, Stok]:
        """
        Reçetesiz ilaç ekle
        
        İlaç sistemde yoksa oluşturur, varsa sadece stok ekler
        
        Args:
            eczane_id: Eczane ID
            ilac_data: İlaç ve stok bilgileri
        
        Returns:
            tuple: (Ilac, Stok)
        """
        # Kategori validasyonu
        try:
            kategori = IlacKategori(ilac_data.kategori)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Geçersiz kategori. Geçerli değerler: normal, kirmizi_recete, soguk_zincir"
            )
        
        # İlaç var mı kontrol et (barkoda göre)
        ilac = self.ilac_repo.get_by_barkod(ilac_data.barkod)
        
        if not ilac:
            # Yeni ilaç oluştur (sadece reçetesiz)
            from app.schemas.ilac import IlacCreate
            
            ilac_create = IlacCreate(
                barkod=ilac_data.barkod,
                ad=ilac_data.ad,
                kategori=kategori,
                kullanim_talimati=ilac_data.kullanim_talimati,
                fiyat=ilac_data.fiyat,
                receteli=False,  # Eczane sadece reçetesiz ekleyebilir
                etken_madde=ilac_data.etken_madde,
                firma=ilac_data.firma
            )
            
            ilac = self.ilac_repo.create(ilac_create)
        else:
            # İlaç varsa reçeteli mi kontrol et
            if ilac.receteli:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Bu ilaç reçetelidir. Sadece reçetesiz ilaç ekleyebilirsiniz."
                )
        
        # Stok oluştur veya güncelle
        stok_create = StokCreate(
            ilac_id=str(ilac.id),
            miktar=ilac_data.baslangic_stok,
            min_stok=ilac_data.min_stok
        )
        
        stok = self.stok_repo.create(eczane_id, stok_create)
        
        return ilac, stok
    
    def get_stok_uyarilari(self, eczane_id: str) -> List[StokUyari]:
        """
        Düşük stok uyarılarını getir
        
        Args:
            eczane_id: Eczane ID
        
        Returns:
            List[StokUyari]: Uyarı listesi
        """
        dusuk_stoklar = self.stok_repo.get_dusuk_stoklar(eczane_id)
        
        uyarilar = []
        for stok in dusuk_stoklar:
            uyarilar.append(StokUyari(
                ilac_id=str(stok.ilac_id),
                ilac_adi=stok.ilac.ad,
                mevcut_miktar=stok.miktar,
                min_stok=stok.min_stok,
                durum=stok.stok_durumu
            ))
        
        return uyarilar
    
    def update_profil(self, eczane_id: str, update_data: EczaneUpdate) -> Eczane:
        """
        Eczane profil güncelle
        
        Args:
            eczane_id: Eczane ID
            update_data: Güncellenecek veriler
        
        Returns:
            Eczane: Güncellenmiş eczane
        """
        eczane = self.eczane_repo.get_by_id(eczane_id)
        if not eczane:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Eczane bulunamadı"
            )
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(eczane, field, value)
        
        self.db.commit()
        self.db.refresh(eczane)
        
        return eczane
