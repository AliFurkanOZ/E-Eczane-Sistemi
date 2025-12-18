# -*- coding: utf-8 -*-
"""Add DOKTOR (uppercase) to usertype enum"""
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5433,
    database="eczane_db",
    user="postgres",
    password="postgres"
)
conn.autocommit = True
cur = conn.cursor()

print("=" * 50)
print("POSTGRESQL ENUM FIX - UPPERCASE DOKTOR")
print("=" * 50)

# Check current values  
print("\n1. Mevcut usertype degerleri:")
cur.execute("SELECT unnest(enum_range(NULL::usertype))")
values = [row[0] for row in cur.fetchall()]
print(f"   {values}")

# Add uppercase DOKTOR if not exists
if 'DOKTOR' not in values:
    print("\n2. DOKTOR (buyuk harf) ekleniyor...")
    try:
        cur.execute("ALTER TYPE usertype ADD VALUE 'DOKTOR'")
        print("   [OK] DOKTOR eklendi!")
    except psycopg2.errors.DuplicateObject as e:
        print(f"   Zaten mevcut")
    except Exception as e:
        print(f"   Hata: {e}")
else:
    print("\n2. DOKTOR zaten mevcut")

# Verify
print("\n3. Guncel degerler:")
cur.execute("SELECT unnest(enum_range(NULL::usertype))")
values = [row[0] for row in cur.fetchall()]
print(f"   {values}")

cur.close()
conn.close()
print("\n[OK] Tamamlandi!")
