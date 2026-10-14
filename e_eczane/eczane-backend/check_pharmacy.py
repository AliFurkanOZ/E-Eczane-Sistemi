"""Check why a specific pharmacy is not showing up"""
import sys
import logging
sys.path.insert(0, '.')
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

from app.core.database import SessionLocal
from app.models.eczane import Eczane
from app.models.hasta import Hasta
from app.models.stok import Stok
from app.utils.enums import OnayDurumu

db = SessionLocal()

print("=== TÜM ECZANELER ===")
eczaneler = db.query(Eczane).all()
for e in eczaneler:
    stok_count = db.query(Stok).filter(Stok.eczane_id == e.id, Stok.miktar > 0).count()
    onay = "✅ Onaylı" if e.onay_durumu == OnayDurumu.ONAYLANDI else "⏳ Beklemede"
    aktif = "Aktif" if e.user.is_active else "Pasif"
    print(f"{e.eczane_adi}: il={e.il}, ilce={e.ilce}, onay={onay}, user={aktif}, stok={stok_count}")

print("\n=== HASTA ===")
hasta = db.query(Hasta).first()
if hasta:
    print(f"{hasta.ad} {hasta.soyad}: il={hasta.il}, ilce={hasta.ilce}, mahalle={hasta.mahalle}")

db.close()
