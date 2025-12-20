"""
Update all location data for patients and pharmacies
"""
import sys
import logging
sys.path.insert(0, '.')
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

from app.core.database import SessionLocal
from app.models.hasta import Hasta
from app.models.eczane import Eczane

def update_all_locations():
    db = SessionLocal()
    
    try:
        print("=== UPDATING PHARMACIES ===")
        eczaneler = db.query(Eczane).all()
        for e in eczaneler:
            if not e.il:
                # Parse from address
                if e.adres and '/' in e.adres:
                    parts = e.adres.split('/')
                    e.il = parts[-1].strip()
                    # Get ilce from before /
                    if len(parts) >= 2:
                        ilce_part = parts[-2].strip().split(',')[-1].strip()
                        if not e.ilce:
                            e.ilce = ilce_part
                    print(f"  Updated {e.eczane_adi}: il={e.il}, ilce={e.ilce}")
                else:
                    # Default to Ankara if can't parse
                    e.il = "Ankara"
                    print(f"  Default {e.eczane_adi}: il={e.il}")
        
        print("\n=== UPDATING PATIENTS ===")
        hastalar = db.query(Hasta).all()
        for h in hastalar:
            if not h.il:
                # Parse from address
                if h.adres and '/' in h.adres:
                    parts = h.adres.split('/')
                    h.il = parts[-1].strip()
                    if len(parts) >= 2:
                        ilce_part = parts[-2].strip().split(',')[-1].strip()
                        if not h.ilce:
                            h.ilce = ilce_part
                    print(f"  Updated {h.ad}: il={h.il}, ilce={h.ilce}")
                else:
                    h.il = "Ankara"
                    print(f"  Default {h.ad}: il={h.il}")
        
        db.commit()
        
        print("\n=== FINAL STATE ===")
        print("\nHastalar:")
        for h in db.query(Hasta).all():
            print(f"  {h.ad} {h.soyad}: il={h.il}, ilce={h.ilce}, mahalle={h.mahalle}")
        
        print("\nEczaneler:")
        for e in db.query(Eczane).all():
            print(f"  {e.eczane_adi}: il={e.il}, ilce={e.ilce}, mahalle={e.mahalle}")
            
    finally:
        db.close()

if __name__ == "__main__":
    update_all_locations()
