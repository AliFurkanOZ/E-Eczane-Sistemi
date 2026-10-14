"""Script to add sample medicines only"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from decimal import Decimal
from app.core.database import SessionLocal, engine, Base
from app.models.ilac import Ilac
from app.utils.enums import IlacKategori

def add_medicines():
    print("💊 İlaçlar ekleniyor...")
    
    ilaclar_data = [
        {"barkod": "8699123456789", "ad": "Parol 500mg Tablet", "kategori": IlacKategori.NORMAL, "fiyat": Decimal("25.50"), "etken_madde": "Parasetamol", "kullanim_talimati": "Günde 3 kez 1 tablet", "receteli": False, "firma": "Atabay İlaç"},
        {"barkod": "8699987654321", "ad": "Augmentin 1000mg", "kategori": IlacKategori.KIRMIZI_RECETE, "fiyat": Decimal("85.00"), "etken_madde": "Amoksisilin", "kullanim_talimati": "Günde 2 kez 1 tablet", "receteli": True, "firma": "GlaxoSmithKline"},
        {"barkod": "8699555555555", "ad": "Ventolin İnhaler", "kategori": IlacKategori.NORMAL, "fiyat": Decimal("45.75"), "etken_madde": "Salbutamol", "kullanim_talimati": "Gerektiğinde 1-2 puf", "receteli": True, "firma": "GlaxoSmithKline"},
        {"barkod": "8699111111111", "ad": "Voltaren 50mg Tablet", "kategori": IlacKategori.NORMAL, "fiyat": Decimal("32.00"), "etken_madde": "Diklofenak", "kullanim_talimati": "Günde 2-3 kez 1 tablet", "receteli": False, "firma": "Novartis"},
        {"barkod": "8699222222222", "ad": "Nexium 40mg Kapsül", "kategori": IlacKategori.NORMAL, "fiyat": Decimal("68.50"), "etken_madde": "Esomeprazol", "kullanim_talimati": "Günde 1 kez sabah aç karnına", "receteli": True, "firma": "AstraZeneca"},
        {"barkod": "8699333333333", "ad": "Coraspin 100mg", "kategori": IlacKategori.NORMAL, "fiyat": Decimal("15.25"), "etken_madde": "Asetilsalisilik Asit", "kullanim_talimati": "Günde 1 kez 1 tablet", "receteli": False, "firma": "Bayer"},
        {"barkod": "8699444444444", "ad": "Majezik 100mg", "kategori": IlacKategori.NORMAL, "fiyat": Decimal("28.00"), "etken_madde": "Flurbiprofen", "kullanim_talimati": "Günde 2-3 kez 1 tablet", "receteli": False, "firma": "Sanofi"},
        {"barkod": "8699666666666", "ad": "Vermidon Tablet", "kategori": IlacKategori.NORMAL, "fiyat": Decimal("18.50"), "etken_madde": "Parasetamol + Kodein", "kullanim_talimati": "Günde 3 kez 1 tablet", "receteli": True, "firma": "Bayer"},
        {"barkod": "8699777777777", "ad": "C Vitamini 1000mg", "kategori": IlacKategori.NORMAL, "fiyat": Decimal("35.00"), "etken_madde": "Askorbik Asit", "kullanim_talimati": "Günde 1 tablet", "receteli": False, "firma": "Kordel's"},
        {"barkod": "8699888888888", "ad": "D3 Vitamini Damla", "kategori": IlacKategori.NORMAL, "fiyat": Decimal("42.00"), "etken_madde": "Kolekalsiferol", "kullanim_talimati": "Günde 4 damla", "receteli": False, "firma": "Solgar"},
        {"barkod": "8699999999999", "ad": "Omega 3 Balık Yağı", "kategori": IlacKategori.NORMAL, "fiyat": Decimal("75.00"), "etken_madde": "EPA/DHA", "kullanim_talimati": "Günde 2 kapsül", "receteli": False, "firma": "Solgar"},
        {"barkod": "8699101010101", "ad": "İnsülin Novorapid", "kategori": IlacKategori.SOGUK_ZINCIR, "fiyat": Decimal("245.00"), "etken_madde": "İnsülin Aspart", "kullanim_talimati": "Doktor tavsiyesine göre", "receteli": True, "firma": "Novo Nordisk"},
    ]
    
    db = SessionLocal()
    added = 0
    skipped = 0
    
    try:
        for data in ilaclar_data:
            existing = db.query(Ilac).filter(Ilac.barkod == data["barkod"]).first()
            if existing:
                print(f"  ⚠️ {data['ad']} zaten mevcut")
                skipped += 1
                continue
                
            ilac = Ilac(**data, aktif=True)
            db.add(ilac)
            added += 1
            print(f"  ✅ {data['ad']} ({data['fiyat']}₺)")
        
        db.commit()
        print(f"\n✅ Toplam: {added} ilaç eklendi, {skipped} zaten mevcuttu")
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_medicines()
