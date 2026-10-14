# -*- coding: utf-8 -*-
"""Direct database registration of test doctor"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.doktor import Doktor
from app.utils.enums import UserType

db = SessionLocal()

print("=" * 50)
print("DIREKT DOKTOR KAYDI")
print("=" * 50)

test_email = "test.doktor@hospital.com"

# Check if user exists
existing_user = db.query(User).filter(User.email == test_email).first()
if existing_user:
    print(f"\n[!] Kullanici mevcut: {test_email}")
    print(f"    User Type: {existing_user.user_type}")
    print(f"    Is Active: {existing_user.is_active}")
    
    # Check doktor profile
    existing_doktor = db.query(Doktor).filter(Doktor.user_id == existing_user.id).first()
    if existing_doktor:
        print(f"    Doktor profili: {existing_doktor.ad} {existing_doktor.soyad}")
        print("[OK] Doktor zaten kayitli!")
    else:
        print("    [!] Doktor profili YOK, olusturuluyor...")
        doktor = Doktor(
            user_id=existing_user.id,
            diploma_no="DIP12345",
            ad="Mehmet",
            soyad="Oz",
            uzmanlik="Dahiliye",
            hastane="Ankara Hastanesi"
        )
        db.add(doktor)
        db.commit()
        print("    [OK] Doktor profili olusturuldu!")
else:
    print(f"\n[!] Kullanici yok, olusturuluyor: {test_email}")
    
    # Create user
    user = User(
        email=test_email,
        password_hash=get_password_hash("Test123!"),
        user_type=UserType.DOKTOR,
        is_active=True
    )
    db.add(user)
    db.flush()
    print(f"    [OK] User olusturuldu: {user.id}")
    
    # Create doktor
    doktor = Doktor(
        user_id=user.id,
        diploma_no="DIP12345",
        ad="Mehmet",
        soyad="Oz",
        uzmanlik="Dahiliye",
        hastane="Ankara Hastanesi"
    )
    db.add(doktor)
    db.commit()
    print(f"    [OK] Doktor olusturuldu: {doktor.id}")
    print("\n[OK] Kayit tamamlandi!")

db.close()
print("\n" + "=" * 50)
print("Giris bilgileri:")
print(f"  Email: {test_email}")
print("  Sifre: Test123!")
print("=" * 50)
