# -*- coding: utf-8 -*-
"""Check database tables and enums"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine
from sqlalchemy import text, inspect

db = SessionLocal()

print("=" * 50)
print("VERITABANI KONTROL")
print("=" * 50)

# Check tables
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"\nTablolar ({len(tables)}):")
for t in sorted(tables):
    print(f"  - {t}")

# Check if doktorlar table exists
print("\n" + "-" * 50)
if "doktorlar" in tables:
    print("[OK] doktorlar tablosu mevcut")
    cols = inspector.get_columns("doktorlar")
    print(f"    Kolonlar: {[c['name'] for c in cols]}")
else:
    print("[FAIL] doktorlar tablosu YOK!")

# Check UserType enum values in PostgreSQL
print("\n" + "-" * 50)
print("UserType enum degerleri:")
try:
    result = db.execute(text("SELECT unnest(enum_range(NULL::usertype))"))
    values = [row[0] for row in result]
    print(f"  {values}")
    
    if "doktor" in [v.lower() for v in values] or "DOKTOR" in values:
        print("  [OK] DOKTOR degeri mevcut")
    else:
        print("  [FAIL] DOKTOR degeri YOK - enum guncellenmeli!")
except Exception as e:
    print(f"  [FAIL] Enum sorgusu hatasi: {e}")

db.close()
