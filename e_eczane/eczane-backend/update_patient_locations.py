"""
Update existing patient location data based on known addresses
"""
import sys
import logging
sys.path.insert(0, '.')

logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

from app.core.database import SessionLocal
from app.models.hasta import Hasta

def update_patient_locations():
    db = SessionLocal()
    
    try:
        print("Updating patient location data...")
        
        # Known patient location mappings
        location_map = {
            "12345678901": {"mahalle": "Kızılay", "ilce": "Çankaya", "il": "Ankara"},
            "98765432109": {"mahalle": "Bahçelievler", "ilce": "Yenimahalle", "il": "Ankara"},
        }
        
        hastalar = db.query(Hasta).all()
        updated = 0
        
        for hasta in hastalar:
            # Check if location data is missing
            if not hasta.il:
                # Try known mappings first
                if hasta.tc_no in location_map:
                    locs = location_map[hasta.tc_no]
                    hasta.mahalle = locs["mahalle"]
                    hasta.ilce = locs["ilce"]
                    hasta.il = locs["il"]
                    updated += 1
                    print(f"  ✅ Updated {hasta.ad} {hasta.soyad}: {locs['mahalle']}, {locs['ilce']}/{locs['il']}")
                else:
                    # Try to parse from address
                    if hasta.adres:
                        parts = hasta.adres.split('/')
                        if len(parts) >= 2:
                            hasta.il = parts[-1].strip()
                            # Try to get ilce from before the /
                            ilce_part = parts[-2].strip().split(',')[-1].strip()
                            hasta.ilce = ilce_part
                            # Try to get mahalle from beginning
                            mahalle_part = hasta.adres.split(' Mah')[0]  
                            if mahalle_part:
                                hasta.mahalle = mahalle_part.split(',')[-1].strip()
                            updated += 1
                            print(f"  ✅ Parsed {hasta.ad} {hasta.soyad}: {hasta.mahalle}, {hasta.ilce}/{hasta.il}")
            else:
                print(f"  ℹ️ {hasta.ad} {hasta.soyad} already has location: {hasta.mahalle}, {hasta.ilce}/{hasta.il}")
        
        db.commit()
        print(f"\n✅ Updated {updated} patient records")
        
        # Verify
        print("\n=== Verification ===")
        for hasta in db.query(Hasta).all():
            print(f"{hasta.ad} {hasta.soyad}: mahalle={hasta.mahalle}, ilce={hasta.ilce}, il={hasta.il}")
            
    finally:
        db.close()

if __name__ == "__main__":
    update_patient_locations()
