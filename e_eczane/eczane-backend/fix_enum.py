# -*- coding: utf-8 -*-
"""Add DOKTOR to PostgreSQL usertype enum"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine
from sqlalchemy import text

conn = engine.connect()

print("=" * 50)
print("USERTYPE ENUM GUNCELLEME")
print("=" * 50)

# Check current enum values
print("\nMevcut UserType degerleri:")
try:
    result = conn.execute(text("SELECT unnest(enum_range(NULL::usertype))"))
    values = [row[0] for row in result]
    print(f"  {values}")
except Exception as e:
    print(f"  Sorgu hatasi: {e}")
    values = []

# Add DOKTOR if not exists
if "doktor" not in [v.lower() for v in values] and "DOKTOR" not in values:
    print("\n[!] DOKTOR degeri ekleniyor...")
    try:
        conn.execute(text("ALTER TYPE usertype ADD VALUE IF NOT EXISTS 'doktor'"))
        conn.commit()
        print("[OK] DOKTOR degeri eklendi!")
    except Exception as e:
        print(f"[FAIL] Hata: {e}")
else:
    print("\n[OK] DOKTOR degeri zaten mevcut")

# Check doktorlar table
print("\n" + "-" * 50)
print("doktorlar tablosu kontrol:")
try:
    result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_name = 'doktorlar'"))
    if result.fetchone():
        print("[OK] doktorlar tablosu mevcut")
    else:
        print("[!] doktorlar tablosu olusturuluyor...")
except Exception as e:
    print(f"Hata: {e}")

conn.close()
print("\n[OK] Islem tamamlandi!")
