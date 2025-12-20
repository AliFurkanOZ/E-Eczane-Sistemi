"""Verify location data in database"""
import sys
import logging
sys.path.insert(0, '.')
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

from app.core.database import SessionLocal
from app.models.hasta import Hasta
from app.models.eczane import Eczane

db = SessionLocal()
print("=== HASTALAR ===")
for h in db.query(Hasta).all():
    print(f"{h.ad} {h.soyad}: il={h.il}, ilce={h.ilce}, mahalle={h.mahalle}")

print("\n=== ECZANELER ===")
for e in db.query(Eczane).all():
    print(f"{e.eczane_adi}: il={e.il}, ilce={e.ilce}, mahalle={e.mahalle}")
db.close()
