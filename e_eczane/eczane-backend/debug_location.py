"""
Check and update location data for existing patients and pharmacies
"""
import sys
import logging
sys.path.insert(0, '.')

# Disable SQLAlchemy logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

from app.core.database import SessionLocal
from app.models.hasta import Hasta
from app.models.eczane import Eczane

def check_and_update():
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("HASTA LOCATION DATA")
        print("=" * 60)
        
        hastalar = db.query(Hasta).all()
        for h in hastalar:
            print(f"Hasta: {h.ad} {h.soyad}")
            print(f"  il={h.il}, ilce={h.ilce}, mahalle={h.mahalle}")
            
            # Parse location from address if not set
            if not h.il and h.adres:
                parts = h.adres.split('/')
                if len(parts) >= 2:
                    h.il = parts[-1].strip()
                    ilce_parts = parts[-2].strip().split(',')
                    if ilce_parts:
                        h.ilce = ilce_parts[-1].strip()
                        if len(ilce_parts) >= 2:
                            mahalle_parts = ilce_parts[-2].strip().split(',')
                            if mahalle_parts:
                                h.mahalle = mahalle_parts[-1].strip()
                    print(f"  --> Updated: il={h.il}, ilce={h.ilce}, mahalle={h.mahalle}")
        
        print("\n" + "=" * 60)
        print("ECZANE LOCATION DATA")  
        print("=" * 60)
        
        eczaneler = db.query(Eczane).all()
        for e in eczaneler:
            print(f"Eczane: {e.eczane_adi}")
            print(f"  il={e.il}, ilce={e.ilce}, mahalle={e.mahalle}")
        
        db.commit()
        print("\n✅ Done!")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_and_update()
