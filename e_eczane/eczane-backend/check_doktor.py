# -*- coding: utf-8 -*-
"""Check if doktor exists and try to register"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.doktor import Doktor
from app.utils.enums import UserType

db = SessionLocal()

# Check existing doktors
print("=" * 50)
print("DOKTOR KONTROL")
print("=" * 50)

doktors = db.query(Doktor).all()
print(f"\nMevcut doktorlar: {len(doktors)}")
for d in doktors:
    user = db.query(User).filter(User.id == d.user_id).first()
    print(f"  - {d.ad} {d.soyad} | Diploma: {d.diploma_no} | Email: {user.email if user else 'N/A'}")

# Check doktor users
doktor_users = db.query(User).filter(User.user_type == UserType.DOKTOR).all()
print(f"\nDoktor tipinde kullanicilar: {len(doktor_users)}")
for u in doktor_users:
    print(f"  - Email: {u.email} | Active: {u.is_active}")

# Try to create test doktor if not exists
print("\n" + "=" * 50)

test_email = "test.doktor@hospital.com"
existing = db.query(User).filter(User.email == test_email).first()

if existing:
    print(f"[OK] Test doktor zaten mevcut: {test_email}")
    print(f"     User Type: {existing.user_type}")
    print(f"     Active: {existing.is_active}")
    
    # Check if doktor profile exists
    doktor = db.query(Doktor).filter(Doktor.user_id == existing.id).first()
    if doktor:
        print(f"     Doktor profili: {doktor.ad} {doktor.soyad}")
    else:
        print(f"     [WARN] Doktor profili yok!")
else:
    print(f"[WARN] Test doktor bulunamadi: {test_email}")
    print("       Manuel kayit gerekiyor!")

db.close()
