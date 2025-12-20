"""
Seed Data Script - E-Eczane Sistemi

Bu script test için gerekli kullanıcıları ve örnek verileri oluşturur:
- 1 Admin kullanıcısı
- 2 Hasta kullanıcısı  
- 2 Eczane kullanıcısı (1 onaylı, 1 beklemede)
- Örnek ilaçlar
- Örnek stoklar
- Örnek reçeteler

Kullanım: python -m app.scripts.seed_data
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from datetime import date, timedelta
from decimal import Decimal
import random

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.hasta import Hasta
from app.models.eczane import Eczane
from app.models.admin import Admin
from app.models.ilac import Ilac, MuadilIlac
from app.models.recete import Recete, ReceteIlac, ReceteDurum
from app.models.stok import Stok
from app.utils.enums import UserType, OnayDurumu, IlacKategori


def create_admin(db: Session):
    """Admin kullanıcısı oluştur"""
    print("📛 Admin kullanıcısı oluşturuluyor...")
    
    # Check if admin exists
    existing = db.query(User).filter(User.email == "admin@eczane.com").first()
    if existing:
        print("  ⚠️ Admin zaten mevcut, atlanıyor.")
        return existing
    
    user = User(
        email="admin@eczane.com",
        password_hash=get_password_hash("Admin123!"),
        user_type=UserType.ADMIN,
        is_active=True
    )
    db.add(user)
    db.flush()
    
    admin = Admin(
        user_id=user.id,
        ad="Sistem",
        soyad="Yöneticisi",
        telefon="555 000 00 00"
    )
    db.add(admin)
    db.commit()
    
    print(f"  ✅ Admin oluşturuldu: admin@eczane.com / Admin123!")
    return user


def create_hastalar(db: Session):
    """Hasta kullanıcıları oluştur"""
    print("\n👤 Hasta kullanıcıları oluşturuluyor...")
    
    hastalar_data = [
        {
            "email": "hasta1@test.com",
            "password": "Test123!",
            "tc_no": "12345678901",
            "ad": "Ahmet",
            "soyad": "Yılmaz",
            "adres": "Kızılay Mah. Atatürk Cad. No:15, Çankaya/Ankara",
            "mahalle": "Kızılay",
            "ilce": "Çankaya",
            "il": "Ankara",
            "telefon": "555 111 11 11"
        },
        {
            "email": "hasta2@test.com", 
            "password": "Test123!",
            "tc_no": "98765432109",
            "ad": "Ayşe",
            "soyad": "Demir",
            "adres": "Bahçelievler Mah. İnönü Cad. No:42, Yenimahalle/Ankara",
            "mahalle": "Bahçelievler",
            "ilce": "Yenimahalle",
            "il": "Ankara",
            "telefon": "555 222 22 22"
        }
    ]
    
    created = []
    for data in hastalar_data:
        # Global TC No check
        hasta_by_tc = db.query(Hasta).filter(Hasta.tc_no == data["tc_no"]).first()
        if hasta_by_tc:
            # Update location fields if missing
            if not hasta_by_tc.il:
                hasta_by_tc.il = data.get("il")
                hasta_by_tc.ilce = data.get("ilce")
                hasta_by_tc.mahalle = data.get("mahalle")
                db.commit()
                print(f"  ✅ Hasta lokasyon güncellendi: {data['tc_no']}")
            else:
                print(f"  ⚠️ TC No ({data['tc_no']}) zaten kayıtlı. Atlanıyor.")
            continue

        existing = db.query(User).filter(User.email == data["email"]).first()
        if existing:
            print(f"  ⚠️ {data['email']} zaten mevcut, atlanıyor.")
            continue
            
        user = User(
            email=data["email"],
            password_hash=get_password_hash(data["password"]),
            user_type=UserType.HASTA,
            is_active=True
        )
        db.add(user)
        db.flush()
        
        hasta = Hasta(
            user_id=user.id,
            tc_no=data["tc_no"],
            ad=data["ad"],
            soyad=data["soyad"],
            adres=data["adres"],
            mahalle=data.get("mahalle"),
            ilce=data.get("ilce"),
            il=data.get("il"),
            telefon=data["telefon"]
        )
        db.add(hasta)
        created.append((data["email"], data["password"], hasta))
        
    db.commit()
    
    for email, password, hasta in created:
        print(f"  ✅ Hasta oluşturuldu: {email} / {password} (TC: {hasta.tc_no})")
    
    return created


def create_eczaneler(db: Session):
    """Eczane kullanıcıları oluştur"""
    print("\n🏥 Eczane kullanıcıları oluşturuluyor...")
    
    eczaneler_data = [
        {
            "email": "merkez@eczane.com",
            "password": "Eczane123!",
            "sicil_no": "ECZ001",
            "eczane_adi": "Merkez Eczanesi",
            "adres": "Kızılay Mah. Gazi Mustafa Kemal Blv. No:5, Çankaya/Ankara",
            "telefon": "312 111 11 11",
            "mahalle": "Kızılay",
            "ilce": "Çankaya",
            "il": "Ankara",
            "eczaci_adi": "Mehmet",
            "eczaci_soyadi": "Kaya",
            "eczaci_diploma_no": "DIP001",
            "banka_hesap_no": "1234567890",
            "iban": "TR123456789012345678901234",
            "onay_durumu": OnayDurumu.ONAYLANDI
        },
        {
            "email": "yildiz@eczane.com",
            "password": "Eczane123!",
            "sicil_no": "ECZ002",
            "eczane_adi": "Yıldız Eczanesi",
            "adres": "Bahçelievler Mah. 7. Cadde No:22, Yenimahalle/Ankara",
            "telefon": "312 222 22 22",
            "mahalle": "Bahçelievler",
            "ilce": "Yenimahalle",
            "il": "Ankara",
            "eczaci_adi": "Fatma",
            "eczaci_soyadi": "Öztürk",
            "eczaci_diploma_no": "DIP002",
            "banka_hesap_no": "0987654321",
            "iban": "TR987654321098765432109876",
            "onay_durumu": OnayDurumu.ONAYLANDI
        },
        {
            "email": "yeni@eczane.com",
            "password": "Eczane123!",
            "sicil_no": "ECZ003",
            "eczane_adi": "Yeni Eczanesi",
            "adres": "Etlik Mah. Hastane Cad. No:10, Keçiören/Ankara",
            "telefon": "312 333 33 33",
            "mahalle": "Etlik",
            "ilce": "Keçiören",
            "il": "Ankara",
            "eczaci_adi": "Ali",
            "eczaci_soyadi": "Yıldırım",
            "eczaci_diploma_no": "DIP003",
            "banka_hesap_no": "5555555555",
            "iban": "TR555555555555555555555555",
            "onay_durumu": OnayDurumu.BEKLEMEDE  # Bu eczane onay bekliyor
        }
    ]
    
    created = []
    for data in eczaneler_data:
        # Global sicil_no check
        eczane_by_sicil = db.query(Eczane).filter(Eczane.sicil_no == data["sicil_no"]).first()
        if eczane_by_sicil:
            print(f"  ⚠️ Sicil No ({data['sicil_no']}) zaten kayıtlı. Atlanıyor.")
            continue

        existing_user = db.query(User).filter(User.email == data["email"]).first()
        user_id = None
        
        if existing_user:
            print(f"  ⚠️ {data['email']} kullanıcısı zaten mevcut.")
            user_id = existing_user.id
            
            # Check if Eczane record exists for this user
            existing_eczane = db.query(Eczane).filter(Eczane.user_id == user_id).first()
            if existing_eczane:
                print(f"    ✅ Eczane kaydı da mevcut, atlanıyor.")
                continue
            else:
                print(f"    ❌ Eczane kaydı EKSİK! Oluşturuluyor...")
                user = existing_user  # Use existing user
        else:
            # Create new user
            user = User(
                email=data["email"],
                password_hash=get_password_hash(data["password"]),
                user_type=UserType.ECZANE,
                is_active=True
            )
            db.add(user)
            db.flush()
            user_id = user.id

        
        eczane = Eczane(
            user_id=user.id,
            sicil_no=data["sicil_no"],
            eczane_adi=data["eczane_adi"],
            adres=data["adres"],
            telefon=data["telefon"],
            mahalle=data["mahalle"],
            ilce=data.get("ilce"),
            il=data.get("il"),
            eczaci_adi=data["eczaci_adi"],
            eczaci_soyadi=data["eczaci_soyadi"],
            eczaci_diploma_no=data["eczaci_diploma_no"],
            banka_hesap_no=data["banka_hesap_no"],
            iban=data["iban"],
            onay_durumu=data["onay_durumu"]
        )
        db.add(eczane)
        created.append((data, eczane))
        
    db.commit()
    
    for data, eczane in created:
        status = "✅ Onaylı" if data["onay_durumu"] == OnayDurumu.ONAYLANDI else "⏳ Onay Bekliyor"
        print(f"  {status} Eczane: {data['email']} / {data['password']} (Sicil: {data['sicil_no']})")
    
    return created


def create_ilaclar(db: Session):
    """Örnek ilaçlar oluştur"""
    print("\n💊 İlaçlar oluşturuluyor...")
    
    ilaclar_data = [
        {
            "barkod": "8699123456789",
            "ad": "Parol 500mg Tablet",
            "kategori": IlacKategori.NORMAL,
            "fiyat": Decimal("25.50"),
            "etken_madde": "Parasetamol",
            "kullanim_talimati": "Günde 3 kez 1 tablet, yemeklerden sonra",
            "receteli": False,
            "firma": "Atabay İlaç"
        },
        {
            "barkod": "8699987654321",
            "ad": "Augmentin 1000mg Film Tablet",
            "kategori": IlacKategori.KIRMIZI_RECETE,
            "fiyat": Decimal("85.00"),
            "etken_madde": "Amoksisilin + Klavulanik Asit",
            "kullanim_talimati": "Günde 2 kez 1 tablet, 7 gün boyunca",
            "receteli": True,
            "firma": "GlaxoSmithKline"
        },
        {
            "barkod": "8699555555555",
            "ad": "Ventolin İnhaler",
            "kategori": IlacKategori.NORMAL,
            "fiyat": Decimal("45.75"),
            "etken_madde": "Salbutamol",
            "kullanim_talimati": "Gerektiğinde 1-2 puf",
            "receteli": True,
            "firma": "GlaxoSmithKline"
        },
        {
            "barkod": "8699111111111",
            "ad": "Voltaren 50mg Tablet",
            "kategori": IlacKategori.NORMAL,
            "fiyat": Decimal("32.00"),
            "etken_madde": "Diklofenak",
            "kullanim_talimati": "Günde 2-3 kez 1 tablet",
            "receteli": False,
            "firma": "Novartis"
        },
        {
            "barkod": "8699222222222",
            "ad": "Nexium 40mg Enterik Kapsül",
            "kategori": IlacKategori.NORMAL,
            "fiyat": Decimal("68.50"),
            "etken_madde": "Esomeprazol",
            "kullanim_talimati": "Günde 1 kez 1 kapsül, sabah aç karnına",
            "receteli": True,
            "firma": "AstraZeneca"
        },
        {
            "barkod": "8699333333333",
            "ad": "Coraspin 100mg Tablet",
            "kategori": IlacKategori.NORMAL,
            "fiyat": Decimal("15.25"),
            "etken_madde": "Asetilsalisilik Asit",
            "kullanim_talimati": "Günde 1 kez 1 tablet",
            "receteli": False,
            "firma": "Bayer"
        },
        {
            "barkod": "8699444444444",
            "ad": "Majezik 100mg Film Tablet",
            "kategori": IlacKategori.NORMAL,
            "fiyat": Decimal("28.00"),
            "etken_madde": "Flurbiprofen",
            "kullanim_talimati": "Günde 2-3 kez 1 tablet, yemekle birlikte",
            "receteli": False,
            "firma": "Sanofi"
        },
        {
            "barkod": "8699666666666",
            "ad": "Vermidon Tablet",
            "kategori": IlacKategori.NORMAL,
            "fiyat": Decimal("18.50"),
            "etken_madde": "Parasetamol + Kodein",
            "kullanim_talimati": "Günde 3 kez 1 tablet",
            "receteli": True,
            "firma": "Bayer"
        },
        # Vitaminler ve takviyeler (reçetesiz)
        {
            "barkod": "8699777777777",
            "ad": "C Vitamini 1000mg Tablet",
            "kategori": IlacKategori.NORMAL,
            "fiyat": Decimal("35.00"),
            "etken_madde": "Askorbik Asit",
            "kullanim_talimati": "Günde 1 tablet",
            "receteli": False,
            "firma": "Kordel's"
        },
        {
            "barkod": "8699888888888",
            "ad": "D3 Vitamini 1000 IU Damla",
            "kategori": IlacKategori.NORMAL,
            "fiyat": Decimal("42.00"),
            "etken_madde": "Kolekalsiferol",
            "kullanim_talimati": "Günde 4 damla",
            "receteli": False,
            "firma": "Solgar"
        },
        {
            "barkod": "8699999999999",
            "ad": "Omega 3 Balık Yağı 1000mg",
            "kategori": IlacKategori.NORMAL,
            "fiyat": Decimal("75.00"),
            "etken_madde": "EPA/DHA",
            "kullanim_talimati": "Günde 2 kapsül, yemekle birlikte",
            "receteli": False,
            "firma": "Solgar"
        },
        # Soğuk zincir ilaç
        {
            "barkod": "8699101010101",
            "ad": "İnsülin Novorapid FlexPen",
            "kategori": IlacKategori.SOGUK_ZINCIR,
            "fiyat": Decimal("245.00"),
            "etken_madde": "İnsülin Aspart",
            "kullanim_talimati": "Doktor tavsiyesine göre kullanılır",
            "receteli": True,
            "firma": "Novo Nordisk"
        }
    ]
    
    created_ilaclar = []
    for data in ilaclar_data:
        existing = db.query(Ilac).filter(Ilac.barkod == data["barkod"]).first()
        if existing:
            created_ilaclar.append(existing)
            continue
            
        ilac = Ilac(**data, aktif=True)
        db.add(ilac)
        created_ilaclar.append(ilac)
        
    db.commit()
    print(f"  ✅ {len(created_ilaclar)} ilaç oluşturuldu/güncellendi")
    
    return created_ilaclar


def create_stoklar(db: Session, ilaclar):
    """Eczaneler için stok oluştur"""
    print("\n📦 Stoklar oluşturuluyor...")
    
    eczaneler = db.query(Eczane).filter(Eczane.onay_durumu == OnayDurumu.ONAYLANDI).all()
    
    if not eczaneler:
        print("  ⚠️ Onaylı eczane bulunamadı!")
        return
    
    stok_count = 0
    for eczane in eczaneler:
        for ilac in ilaclar:
            existing = db.query(Stok).filter(
                Stok.eczane_id == eczane.id,
                Stok.ilac_id == ilac.id
            ).first()
            
            if existing:
                continue
                
            stok = Stok(
                eczane_id=eczane.id,
                ilac_id=ilac.id,
                miktar=random.randint(5, 100),
                min_stok=10
            )
            db.add(stok)
            stok_count += 1
    
    db.commit()
    print(f"  ✅ {stok_count} stok kaydı oluşturuldu")


def create_receteler(db: Session, ilaclar):
    """Örnek reçeteler oluştur"""
    print("\n📋 Reçeteler oluşturuluyor...")
    
    hastalar = db.query(Hasta).all()
    if not hastalar:
        print("  ⚠️ Hasta bulunamadı!")
        return
    
    recete_data = [
        {
            "recete_no": "RCT2025001",
            "tc_no": "12345678901",
            "tarih": date.today() - timedelta(days=2),
            "doktor_adi": "Dr. Mehmet Öz",
            "hastane": "Ankara Üniversitesi Tıp Fakültesi",
            "ilac_barkodlar": ["8699123456789", "8699987654321"]
        },
        {
            "recete_no": "RCT2025002",
            "tc_no": "12345678901",
            "tarih": date.today(),
            "doktor_adi": "Dr. Ayşe Kara",
            "hastane": "Hacettepe Üniversitesi Hastanesi",
            "ilac_barkodlar": ["8699555555555"]
        },
        {
            "recete_no": "RCT2025003",
            "tc_no": "98765432109",
            "tarih": date.today() - timedelta(days=5),
            "doktor_adi": "Dr. Ali Veli",
            "hastane": "Gazi Üniversitesi Hastanesi",
            "ilac_barkodlar": ["8699111111111", "8699222222222", "8699333333333"]
        }
    ]
    
    created = 0
    for data in recete_data:
        existing = db.query(Recete).filter(Recete.recete_no == data["recete_no"]).first()
        if existing:
            continue
            
        recete = Recete(
            recete_no=data["recete_no"],
            tc_no=data["tc_no"],
            tarih=data["tarih"],
            durum=ReceteDurum.AKTIF,
            doktor_adi=data["doktor_adi"],
            hastane=data["hastane"]
        )
        db.add(recete)
        db.flush()
        
        for barkod in data["ilac_barkodlar"]:
            ilac = db.query(Ilac).filter(Ilac.barkod == barkod).first()
            if ilac:
                recete_ilac = ReceteIlac(
                    recete_id=recete.id,
                    ilac_id=ilac.id,
                    miktar=random.randint(1, 3),
                    kullanim_suresi="7 gün"
                )
                db.add(recete_ilac)
        
        created += 1
    
    db.commit()
    print(f"  ✅ {created} reçete oluşturuldu")


def main():
    print("=" * 60)
    print("🏥 E-Eczane Sistemi - Seed Data Script")
    print("=" * 60)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create users
        create_admin(db)
        create_hastalar(db)
        create_eczaneler(db)
        
        # Create data
        ilaclar = create_ilaclar(db)
        create_stoklar(db, ilaclar)
        create_receteler(db, ilaclar)
        
        print("\n" + "=" * 60)
        print("✅ Seed data başarıyla oluşturuldu!")
        print("=" * 60)
        print("\n📝 Test Hesapları:")
        print("-" * 40)
        print("Admin:   admin@eczane.com     / Admin123!")
        print("Hasta 1: hasta1@test.com      / Test123!  (TC: 12345678901)")
        print("Hasta 2: hasta2@test.com      / Test123!  (TC: 98765432109)")
        print("Eczane:  merkez@eczane.com    / Eczane123! (Onaylı)")
        print("Eczane:  yildiz@eczane.com    / Eczane123! (Onaylı)")
        print("Eczane:  yeni@eczane.com      / Eczane123! (Onay Bekliyor)")
        print("-" * 40)
        
    except Exception as e:
        print(f"\n❌ Hata: {e}")
        import traceback
        traceback.print_exc()
        # Print cause if available
        if hasattr(e, 'orig'):
            print(f"Original error: {e.orig}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
