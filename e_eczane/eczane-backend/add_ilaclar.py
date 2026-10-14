# -*- coding: utf-8 -*-
"""
Ilac, Muadil ve Stok Ekleme Scripti
20 ilac, 5 muadil iliskisi ve 3 eczaneye stok ekler.
"""
import sys
import os
import random
sys.path.insert(0, '.')

from decimal import Decimal
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.ilac import Ilac, MuadilIlac
from app.models.stok import Stok
from app.models.eczane import Eczane
from app.utils.enums import IlacKategori, OnayDurumu

# Ilac listesi
ILACLAR = [
    # Agri Kesiciler
    {
        "barkod": "8699123456001",
        "ad": "Parol 500mg Tablet",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("28.50"),
        "etken_madde": "Parasetamol",
        "kullanim_talimati": "Gunde 3 kez 1 tablet, yemeklerden sonra",
        "receteli": False,
        "firma": "Atabay Ilac"
    },
    {
        "barkod": "8699123456002",
        "ad": "Minoset 500mg Tablet",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("25.00"),
        "etken_madde": "Parasetamol",
        "kullanim_talimati": "Gunde 3 kez 1 tablet, yemeklerden sonra",
        "receteli": False,
        "firma": "Bayer"
    },
    {
        "barkod": "8699123456003",
        "ad": "Aspirin 100mg Tablet",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("22.00"),
        "etken_madde": "Asetilsalisilik Asit",
        "kullanim_talimati": "Gunde 1 kez 1 tablet",
        "receteli": False,
        "firma": "Bayer"
    },
    {
        "barkod": "8699123456004",
        "ad": "Majezik 100mg Film Tablet",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("35.00"),
        "etken_madde": "Flurbiprofen",
        "kullanim_talimati": "Gunde 2-3 kez 1 tablet, yemekle birlikte",
        "receteli": False,
        "firma": "Sanofi"
    },
    {
        "barkod": "8699123456005",
        "ad": "Voltaren 50mg Tablet",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("42.00"),
        "etken_madde": "Diklofenak",
        "kullanim_talimati": "Gunde 2-3 kez 1 tablet",
        "receteli": False,
        "firma": "Novartis"
    },
    # Antibiyotikler (Kirmizi Recete)
    {
        "barkod": "8699123456006",
        "ad": "Augmentin 1000mg Tablet",
        "kategori": IlacKategori.KIRMIZI_RECETE,
        "fiyat": Decimal("95.00"),
        "etken_madde": "Amoksisilin + Klavulanik Asit",
        "kullanim_talimati": "Gunde 2 kez 1 tablet, 7 gun boyunca",
        "receteli": True,
        "firma": "GlaxoSmithKline"
    },
    {
        "barkod": "8699123456007",
        "ad": "Amoklavin 1000mg Tablet",
        "kategori": IlacKategori.KIRMIZI_RECETE,
        "fiyat": Decimal("85.00"),
        "etken_madde": "Amoksisilin + Klavulanik Asit",
        "kullanim_talimati": "Gunde 2 kez 1 tablet, 7 gun boyunca",
        "receteli": True,
        "firma": "Deva Holding"
    },
    {
        "barkod": "8699123456008",
        "ad": "Cefzil 500mg Tablet",
        "kategori": IlacKategori.KIRMIZI_RECETE,
        "fiyat": Decimal("78.00"),
        "etken_madde": "Sefprozil",
        "kullanim_talimati": "Gunde 2 kez 1 tablet",
        "receteli": True,
        "firma": "Bristol-Myers Squibb"
    },
    # Mide Ilaclari
    {
        "barkod": "8699123456009",
        "ad": "Nexium 40mg Kapsul",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("75.00"),
        "etken_madde": "Esomeprazol",
        "kullanim_talimati": "Gunde 1 kez 1 kapsul, sabah ac karnina",
        "receteli": True,
        "firma": "AstraZeneca"
    },
    {
        "barkod": "8699123456010",
        "ad": "Lansor 30mg Kapsul",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("65.00"),
        "etken_madde": "Lansoprazol",
        "kullanim_talimati": "Gunde 1 kez 1 kapsul, sabah ac karnina",
        "receteli": True,
        "firma": "Sanovel"
    },
    {
        "barkod": "8699123456011",
        "ad": "Gaviscon Likit 200ml",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("48.00"),
        "etken_madde": "Aljinik Asit",
        "kullanim_talimati": "Yemeklerden sonra 10-20 ml",
        "receteli": False,
        "firma": "Reckitt Benckiser"
    },
    # Alerji / Soguk Alginligi
    {
        "barkod": "8699123456012",
        "ad": "Aerius 5mg Tablet",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("55.00"),
        "etken_madde": "Desloratadin",
        "kullanim_talimati": "Gunde 1 kez 1 tablet",
        "receteli": False,
        "firma": "MSD"
    },
    {
        "barkod": "8699123456013",
        "ad": "Zyrtec 10mg Tablet",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("50.00"),
        "etken_madde": "Setirizin",
        "kullanim_talimati": "Gunde 1 kez 1 tablet",
        "receteli": False,
        "firma": "UCB Pharma"
    },
    {
        "barkod": "8699123456014",
        "ad": "Sudafed 60mg Tablet",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("38.00"),
        "etken_madde": "Psodoefedrin",
        "kullanim_talimati": "Gunde 3-4 kez 1 tablet",
        "receteli": False,
        "firma": "Johnson & Johnson"
    },
    # Vitamin ve Takviyeler
    {
        "barkod": "8699123456015",
        "ad": "C Vitamini 1000mg Tablet",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("45.00"),
        "etken_madde": "Askorbik Asit",
        "kullanim_talimati": "Gunde 1 tablet",
        "receteli": False,
        "firma": "Solgar"
    },
    {
        "barkod": "8699123456016",
        "ad": "D3 Vitamini 1000 IU Damla",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("55.00"),
        "etken_madde": "Kolekalsiferol",
        "kullanim_talimati": "Gunde 4 damla",
        "receteli": False,
        "firma": "Solgar"
    },
    {
        "barkod": "8699123456017",
        "ad": "B12 Vitamini 1000mcg Tablet",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("60.00"),
        "etken_madde": "Siyanokobalamin",
        "kullanim_talimati": "Gunde 1 tablet",
        "receteli": False,
        "firma": "Solgar"
    },
    {
        "barkod": "8699123456018",
        "ad": "Omega 3 Balik Yagi 1000mg",
        "kategori": IlacKategori.NORMAL,
        "fiyat": Decimal("85.00"),
        "etken_madde": "EPA/DHA",
        "kullanim_talimati": "Gunde 2 kapsul, yemekle birlikte",
        "receteli": False,
        "firma": "Solgar"
    },
    # Soguk Zincir Ilaclar
    {
        "barkod": "8699123456019",
        "ad": "Novorapid FlexPen Insulin",
        "kategori": IlacKategori.SOGUK_ZINCIR,
        "fiyat": Decimal("285.00"),
        "etken_madde": "Insulin Aspart",
        "kullanim_talimati": "Doktor tavsiyesine gore kullanilir",
        "receteli": True,
        "firma": "Novo Nordisk"
    },
    {
        "barkod": "8699123456020",
        "ad": "Lantus SoloStar Insulin",
        "kategori": IlacKategori.SOGUK_ZINCIR,
        "fiyat": Decimal("320.00"),
        "etken_madde": "Insulin Glarjin",
        "kullanim_talimati": "Doktor tavsiyesine gore kullanilir",
        "receteli": True,
        "firma": "Sanofi"
    },
]

# Muadil iliskileri (barkod ciftleri)
MUADIL_CIFTLERI = [
    ("8699123456001", "8699123456002"),  # Parol - Minoset
    ("8699123456006", "8699123456007"),  # Augmentin - Amoklavin
    ("8699123456009", "8699123456010"),  # Nexium - Lansor
    ("8699123456012", "8699123456013"),  # Aerius - Zyrtec
    ("8699123456019", "8699123456020"),  # Novorapid - Lantus
]


def add_ilaclar(db: Session):
    """Ilaclari ekle"""
    print("\n" + "=" * 60)
    print("ILACLAR EKLENIYOR...")
    print("=" * 60)
    
    created = []
    for ilac_data in ILACLAR:
        # Mevcut kontrol
        existing = db.query(Ilac).filter(Ilac.barkod == ilac_data["barkod"]).first()
        if existing:
            print(f"  [ATLANDI] {ilac_data['ad']} zaten mevcut")
            created.append(existing)
            continue
        
        ilac = Ilac(**ilac_data, aktif=True)
        db.add(ilac)
        created.append(ilac)
        print(f"  [OK] {ilac_data['ad']} eklendi")
    
    db.commit()
    print(f"\n  TOPLAM: {len(created)} ilac")
    return created


def add_muadiller(db: Session):
    """Muadil iliskilerini ekle"""
    print("\n" + "=" * 60)
    print("MUADIL ILISKILERI EKLENIYOR...")
    print("=" * 60)
    
    count = 0
    for barkod1, barkod2 in MUADIL_CIFTLERI:
        ilac1 = db.query(Ilac).filter(Ilac.barkod == barkod1).first()
        ilac2 = db.query(Ilac).filter(Ilac.barkod == barkod2).first()
        
        if not ilac1 or not ilac2:
            print(f"  [HATA] Ilac bulunamadi: {barkod1} veya {barkod2}")
            continue
        
        # Cift yonlu iliski ekle (A->B ve B->A)
        for (a, b) in [(ilac1, ilac2), (ilac2, ilac1)]:
            existing = db.query(MuadilIlac).filter(
                MuadilIlac.ilac_id == a.id,
                MuadilIlac.muadil_ilac_id == b.id
            ).first()
            
            if not existing:
                muadil = MuadilIlac(ilac_id=a.id, muadil_ilac_id=b.id)
                db.add(muadil)
                count += 1
        
        print(f"  [OK] {ilac1.ad} <-> {ilac2.ad}")
    
    db.commit()
    print(f"\n  TOPLAM: {count} muadil iliskisi")


def add_stoklar(db: Session):
    """Tum eczanelere stok ekle"""
    print("\n" + "=" * 60)
    print("STOKLAR EKLENIYOR...")
    print("=" * 60)
    
    # Onayli eczaneleri al
    eczaneler = db.query(Eczane).filter(Eczane.onay_durumu == OnayDurumu.ONAYLANDI).all()
    ilaclar = db.query(Ilac).filter(Ilac.aktif == True).all()
    
    if not eczaneler:
        print("  [HATA] Onayli eczane bulunamadi!")
        return
    
    if not ilaclar:
        print("  [HATA] Ilac bulunamadi!")
        return
    
    stok_count = 0
    for eczane in eczaneler:
        eczane_stok = 0
        for ilac in ilaclar:
            # Mevcut stok kontrol
            existing = db.query(Stok).filter(
                Stok.eczane_id == eczane.id,
                Stok.ilac_id == ilac.id
            ).first()
            
            if existing:
                continue
            
            stok = Stok(
                eczane_id=eczane.id,
                ilac_id=ilac.id,
                miktar=random.randint(10, 100),
                min_stok=5
            )
            db.add(stok)
            stok_count += 1
            eczane_stok += 1
        
        print(f"  [OK] {eczane.eczane_adi}: {eczane_stok} ilac stok eklendi")
    
    db.commit()
    print(f"\n  TOPLAM: {stok_count} stok kaydi")


def main():
    print("\n")
    print("*" * 60)
    print("*  ILAC, MUADIL VE STOK EKLEME SCRIPTI                    *")
    print("*" * 60)
    
    db = SessionLocal()
    try:
        # 1. Ilaclari ekle
        add_ilaclar(db)
        
        # 2. Muadil iliskilerini ekle
        add_muadiller(db)
        
        # 3. Eczanelere stok ekle
        add_stoklar(db)
        
        print("\n" + "=" * 60)
        print("[TAMAMLANDI] Tum islemler basariyla tamamlandi!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n[HATA] {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
