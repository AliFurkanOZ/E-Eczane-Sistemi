# -*- coding: utf-8 -*-
"""Add DOKTOR to usertype enum via raw SQL"""
import psycopg2

# Connection parameters from .env
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
print("POSTGRESQL ENUM GUNCELLEME")
print("=" * 50)

# Check current values
print("\n1. Mevcut usertype degerleri:")
cur.execute("SELECT unnest(enum_range(NULL::usertype))")
values = [row[0] for row in cur.fetchall()]
print(f"   {values}")

# Add DOKTOR if not exists
if 'doktor' not in [v.lower() for v in values]:
    print("\n2. DOKTOR degeri ekleniyor...")
    try:
        cur.execute("ALTER TYPE usertype ADD VALUE 'doktor'")
        print("   [OK] DOKTOR eklendi!")
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
