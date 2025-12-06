from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from app.models.ilac import Ilac, MuadilIlac
from app.models.stok import Stok
from app.schemas.ilac import IlacCreate, IlacUpdate, IlacSearchParams
from decimal import Decimal
from uuid import UUID


class IlacRepository:
    """İlaç repository - Database operations for drugs"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, ilac_id: UUID) -> Optional[Ilac]:
        """
        ID'ye göre ilaç getir
        
        Args:
            ilac_id: İlaç UUID
        
        Returns:
            Ilac veya None
        """
        return self.db.query(Ilac).filter(
            Ilac.id == ilac_id,
            Ilac.aktif == True
        ).first()
    
    def get_by_barkod(self, barkod: str) -> Optional[Ilac]:
        """
        Barkoda göre ilaç getir
        
        Args:
            barkod: İlaç barkod numarası
        
        Returns:
            Ilac veya None
        """
        return self.db.query(Ilac).filter(
            Ilac.barkod == barkod,
            Ilac.aktif == True
        ).first()
    
    def search(self, params: IlacSearchParams) -> Tuple[List[Ilac], int]:
        """
        İlaç arama (filtreleme ve sayfalama ile)
        
        Args:
            params: Arama parametreleri
        
        Returns:
            tuple: (ilaclar listesi, toplam kayıt sayısı)
        """
        query = self.db.query(Ilac).filter(Ilac.aktif == True)
        
        # Text search (ad, barkod veya etken madde)
        if params.query:
            search_term = f"%{params.query}%"
            query = query.filter(
                or_(
                    Ilac.ad.ilike(search_term),
                    Ilac.barkod.ilike(search_term),
                    Ilac.etken_madde.ilike(search_term)
                )
            )
        
        # Kategori filtresi
        if params.kategori:
            query = query.filter(Ilac.kategori == params.kategori)
        
        # Reçeteli/reçetesiz filtresi
        if params.receteli is not None:
            query = query.filter(Ilac.receteli == params.receteli)
        
        # Fiyat aralığı
        if params.min_fiyat is not None:
            query = query.filter(Ilac.fiyat >= params.min_fiyat)
        if params.max_fiyat is not None:
            query = query.filter(Ilac.fiyat <= params.max_fiyat)
        
        # Toplam kayıt sayısı
        total = query.count()
        
        # Sayfalama
        offset = (params.page - 1) * params.page_size
        ilaclar = query.order_by(Ilac.ad).offset(offset).limit(params.page_size).all()
        
        return ilaclar, total
    
    def get_muadiller(self, ilac_id: UUID) -> List[Ilac]:
        """
        Bir ilacın muadillerini getir
        
        Args:
            ilac_id: Ana ilacın UUID'si
        
        Returns:
            Muadil ilaçlar listesi
        """
        # Muadil ilaç ID'lerini al
        muadil_ids_tuples = self.db.query(MuadilIlac.muadil_ilac_id).filter(
            MuadilIlac.ilac_id == ilac_id
        ).all()
        
        # ID listesini çıkar
        ids = [m[0] for m in muadil_ids_tuples]
        
        if not ids:
            return []
        
        # Muadil ilaçları getir
        return self.db.query(Ilac).filter(
            Ilac.id.in_(ids),
            Ilac.aktif == True
        ).all()
    
    def get_with_stok(self, ilac_id: UUID, eczane_id: UUID) -> Tuple[Optional[Ilac], Optional[Stok]]:
        """
        İlaç ve stok bilgisini birlikte getir
        
        Args:
            ilac_id: İlaç UUID
            eczane_id: Eczane UUID
        
        Returns:
            tuple: (Ilac, Stok) veya (None, None)
        """
        ilac = self.get_by_id(ilac_id)
        if not ilac:
            return None, None
        
        stok = self.db.query(Stok).filter(
            Stok.ilac_id == ilac_id,
            Stok.eczane_id == eczane_id
        ).first()
        
        return ilac, stok
    
    def create(self, ilac_data: IlacCreate) -> Ilac:
        """
        Yeni ilaç oluştur
        
        Args:
            ilac_data: İlaç bilgileri
        
        Returns:
            Oluşturulan ilaç
        """
        ilac = Ilac(**ilac_data.model_dump())
        self.db.add(ilac)
        self.db.commit()
        self.db.refresh(ilac)
        return ilac
    
    def update(self, ilac_id: UUID, ilac_data: IlacUpdate) -> Optional[Ilac]:
        """
        İlaç güncelle
        
        Args:
            ilac_id: İlaç UUID
            ilac_data: Güncellenecek bilgiler
        
        Returns:
            Güncellenen ilaç veya None
        """
        ilac = self.get_by_id(ilac_id)
        if not ilac:
            return None
        
        update_data = ilac_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(ilac, field, value)
        
        self.db.commit()
        self.db.refresh(ilac)
        return ilac
    
    def delete(self, ilac_id: UUID) -> bool:
        """
        İlaç sil (soft delete - aktif=False)
        
        Args:
            ilac_id: İlaç UUID
        
        Returns:
            Başarılı ise True
        """
        ilac = self.get_by_id(ilac_id)
        if not ilac:
            return False
        
        ilac.aktif = False
        self.db.commit()
        return True
    
    def get_all(self, skip: int = 0, limit: int = 100, aktif_only: bool = True) -> List[Ilac]:
        """
        Tüm ilaçları getir
        
        Args:
            skip: Atlanacak kayıt sayısı
            limit: Maksimum kayıt sayısı
            aktif_only: Sadece aktif ilaçlar mı
        
        Returns:
            İlaç listesi
        """
        query = self.db.query(Ilac)
        
        if aktif_only:
            query = query.filter(Ilac.aktif == True)
        
        return query.order_by(Ilac.ad).offset(skip).limit(limit).all()
    
    def add_muadil(self, ilac_id: UUID, muadil_ilac_id: UUID) -> MuadilIlac:
        """
        İlaca muadil ekle
        
        Args:
            ilac_id: Ana ilacın UUID'si
            muadil_ilac_id: Muadil ilacın UUID'si
        
        Returns:
            MuadilIlac ilişkisi
        """
        muadil = MuadilIlac(
            ilac_id=ilac_id,
            muadil_ilac_id=muadil_ilac_id
        )
        self.db.add(muadil)
        self.db.commit()
        self.db.refresh(muadil)
        return muadil
    
    def remove_muadil(self, ilac_id: UUID, muadil_ilac_id: UUID) -> bool:
        """
        İlaçtan muadil kaldır
        
        Args:
            ilac_id: Ana ilacın UUID'si
            muadil_ilac_id: Muadil ilacın UUID'si
        
        Returns:
            Başarılı ise True
        """
        muadil = self.db.query(MuadilIlac).filter(
            MuadilIlac.ilac_id == ilac_id,
            MuadilIlac.muadil_ilac_id == muadil_ilac_id
        ).first()
        
        if not muadil:
            return False
        
        self.db.delete(muadil)
        self.db.commit()
        return True
