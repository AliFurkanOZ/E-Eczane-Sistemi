from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import date, timedelta
from decimal import Decimal
from app.schemas.recete import ReceteQuery, ReceteResponse, ReceteIlacItem
from app.models.ilac import Ilac
from app.models.recete import Recete, ReceteIlac, ReceteDurum
from app.utils.enums import IlacKategori
import random


class ReceteService:
    """
    Fake Reçete Servisi
    
    Gerçek uygulamada burası devlet sistemine (e-Nabız) bağlanacak.
    Şimdilik simülasyon için fake data kullanıyoruz.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def sorgula_recete(self, query: ReceteQuery) -> Optional[ReceteResponse]:
        """
        Reçete sorgula
        
        Args:
            query: TC No ve Reçete No
        
        Returns:
            ReceteResponse veya None
        """
        # Önce database'de var mı kontrol et
        recete = self.db.query(Recete).filter(
            Recete.recete_no == query.recete_no,
            Recete.tc_no == query.tc_no,
            Recete.durum == ReceteDurum.AKTIF
        ).first()
        
        if recete:
            return self._recete_to_response(recete)
        
        # Database'de yoksa fake data döndür (simülasyon)
        return self._generate_fake_recete(query)
    
    def _recete_to_response(self, recete: Recete) -> ReceteResponse:
        """Recete modelini ReceteResponse'a dönüştür"""
        ilac_listesi = []
        toplam_tutar = Decimal('0.00')
        
        for recete_ilac in recete.ilaclar:
            ilac = recete_ilac.ilac
            ara_toplam = ilac.fiyat * recete_ilac.miktar
            toplam_tutar += ara_toplam
            
            ilac_listesi.append(ReceteIlacItem(
                ilac_id=str(ilac.id),
                barkod=ilac.barkod,
                ad=ilac.ad,
                kategori=ilac.kategori,
                miktar=recete_ilac.miktar,
                kullanim_talimati=ilac.kullanim_talimati,
                fiyat=ilac.fiyat,
                etken_madde=ilac.etken_madde
            ))
        
        return ReceteResponse(
            recete_no=recete.recete_no,
            tc_no=recete.tc_no,
            tarih=recete.tarih,
            doktor_adi=recete.doktor_adi,
            hastane=recete.hastane,
            ilac_listesi=ilac_listesi,
            toplam_tutar=toplam_tutar
        )
    
    def _generate_fake_recete(self, query: ReceteQuery) -> Optional[ReceteResponse]:
        """
        Fake reçete oluştur (Simülasyon)
        
        Gerçek sistemde bu fonksiyon olmayacak, API'den gelecek
        """
        # Fake reçete data
        fake_receteler = {
            "RCT2025001": {
                "tc_list": ["12345678901", "11111111111"],
                "ilaclar": [
                    {"barkod": "8699123456789", "miktar": 2},
                    {"barkod": "8699987654321", "miktar": 1},
                ]
            },
            "RCT2025002": {
                "tc_list": ["12345678901"],
                "ilaclar": [
                    {"barkod": "8699555555555", "miktar": 1},
                ]
            },
            "RCT2025003": {
                "tc_list": ["98765432109"],
                "ilaclar": [
                    {"barkod": "8699111111111", "miktar": 3},
                    {"barkod": "8699222222222", "miktar": 1},
                    {"barkod": "8699333333333", "miktar": 2},
                ]
            }
        }
        
        # Reçete var mı kontrol et
        if query.recete_no not in fake_receteler:
            return None
        
        recete_data = fake_receteler[query.recete_no]
        
        # TC No eşleşiyor mu
        if query.tc_no not in recete_data["tc_list"]:
            return None
        
        # İlaçları database'den al veya oluştur
        ilac_listesi = []
        toplam_tutar = Decimal('0.00')
        
        for ilac_info in recete_data["ilaclar"]:
            ilac = self._get_or_create_fake_ilac(ilac_info["barkod"])
            if ilac:
                ara_toplam = ilac.fiyat * ilac_info["miktar"]
                toplam_tutar += ara_toplam
                
                ilac_listesi.append(ReceteIlacItem(
                    ilac_id=str(ilac.id),
                    barkod=ilac.barkod,
                    ad=ilac.ad,
                    kategori=ilac.kategori,
                    miktar=ilac_info["miktar"],
                    kullanim_talimati=ilac.kullanim_talimati,
                    fiyat=ilac.fiyat,
                    etken_madde=ilac.etken_madde
                ))
        
        # Fake reçeteyi database'e kaydet (bir sonraki sorguda kullanılmak üzere)
        self._save_fake_recete(query, ilac_listesi)
        
        return ReceteResponse(
            recete_no=query.recete_no,
            tc_no=query.tc_no,
            tarih=date.today() - timedelta(days=random.randint(0, 7)),
            doktor_adi=random.choice([
                "Dr. Mehmet Yılmaz",
                "Dr. Ayşe Demir",
                "Dr. Ahmet Kaya"
            ]),
            hastane=random.choice([
                "Ankara Üniversitesi Tıp Fakültesi",
                "Hacettepe Üniversitesi Hastanesi",
                "Gazi Üniversitesi Hastanesi"
            ]),
            ilac_listesi=ilac_listesi,
            toplam_tutar=toplam_tutar
        )
    
    def _get_or_create_fake_ilac(self, barkod: str) -> Optional[Ilac]:
        """Fake ilaç getir veya oluştur"""
        # Database'de var mı kontrol et
        ilac = self.db.query(Ilac).filter(Ilac.barkod == barkod).first()
        if ilac:
            return ilac
        
        # Fake ilaç data
        fake_ilaclar = {
            "8699123456789": {
                "ad": "Parol 500mg Tablet",
                "kategori": IlacKategori.NORMAL,
                "fiyat": Decimal("25.50"),
                "etken_madde": "Parasetamol",
                "kullanim_talimati": "Günde 3 kez 1 tablet, yemeklerden sonra",
                "receteli": False
            },
            "8699987654321": {
                "ad": "Augmentin 1000mg Film Tablet",
                "kategori": IlacKategori.KIRMIZI_RECETE,
                "fiyat": Decimal("85.00"),
                "etken_madde": "Amoksisilin + Klavulanik Asit",
                "kullanim_talimati": "Günde 2 kez 1 tablet, 7 gün boyunca",
                "receteli": True
            },
            "8699555555555": {
                "ad": "Ventolin İnhaler",
                "kategori": IlacKategori.NORMAL,
                "fiyat": Decimal("45.75"),
                "etken_madde": "Salbutamol",
                "kullanim_talimati": "Gerektiğinde 1-2 puf",
                "receteli": True
            },
            "8699111111111": {
                "ad": "Voltaren 50mg Tablet",
                "kategori": IlacKategori.NORMAL,
                "fiyat": Decimal("32.00"),
                "etken_madde": "Diklofenak",
                "kullanim_talimati": "Günde 2-3 kez 1 tablet",
                "receteli": False
            },
            "8699222222222": {
                "ad": "Nexium 40mg",
                "kategori": IlacKategori.NORMAL,
                "fiyat": Decimal("68.50"),
                "etken_madde": "Esomeprazol",
                "kullanim_talimati": "Günde 1 kez 1 tablet, sabah aç karnına",
                "receteli": True
            },
            "8699333333333": {
                "ad": "Coraspin 100mg",
                "kategori": IlacKategori.NORMAL,
                "fiyat": Decimal("15.25"),
                "etken_madde": "Asetilsalisilik Asit",
                "kullanim_talimati": "Günde 1 kez 1 tablet",
                "receteli": False
            }
        }
        
        if barkod not in fake_ilaclar:
            return None
        
        # Yeni ilaç oluştur
        ilac_data = fake_ilaclar[barkod]
        ilac = Ilac(
            barkod=barkod,
            ad=ilac_data["ad"],
            kategori=ilac_data["kategori"],
            fiyat=ilac_data["fiyat"],
            etken_madde=ilac_data["etken_madde"],
            kullanim_talimati=ilac_data["kullanim_talimati"],
            receteli=ilac_data["receteli"],
            firma="Fake Pharma",
            aktif=True
        )
        
        self.db.add(ilac)
        self.db.commit()
        self.db.refresh(ilac)
        
        return ilac
    
    def _save_fake_recete(self, query: ReceteQuery, ilac_listesi: List[ReceteIlacItem]):
        """Fake reçeteyi database'e kaydet"""
        # Check if prescription already exists (avoid unique constraint violation)
        existing = self.db.query(Recete).filter(
            Recete.recete_no == query.recete_no
        ).first()
        
        if existing:
            # Prescription already saved, skip
            return
        
        # Reçete oluştur
        recete = Recete(
            recete_no=query.recete_no,
            tc_no=query.tc_no,
            tarih=date.today(),
            durum=ReceteDurum.AKTIF,
            doktor_adi="Dr. Test",
            hastane="Test Hastanesi"
        )
        self.db.add(recete)
        self.db.flush()
        
        # İlaçları ekle
        for ilac_item in ilac_listesi:
            recete_ilac = ReceteIlac(
                recete_id=recete.id,
                ilac_id=ilac_item.ilac_id,
                miktar=ilac_item.miktar
            )
            self.db.add(recete_ilac)
        
        self.db.commit()
