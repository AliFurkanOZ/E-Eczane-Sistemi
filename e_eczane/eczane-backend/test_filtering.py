"""
Test the pharmacy filtering logic
"""
import sys
import logging
sys.path.insert(0, '.')
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

from app.core.database import SessionLocal
from app.models.hasta import Hasta
from app.models.eczane import Eczane
from app.models.ilac import Ilac
from app.models.stok import Stok
from app.repositories.eczane_repository import EczaneRepository

def test_filtering():
    db = SessionLocal()
    
    try:
        # Get first hasta
        hasta = db.query(Hasta).first()
        print(f"Testing with patient: {hasta.ad} {hasta.soyad}")
        print(f"  Location: mahalle={hasta.mahalle}, ilce={hasta.ilce}, il={hasta.il}")
        
        # Get first ilac with stock
        stok = db.query(Stok).filter(Stok.miktar > 0).first()
        if not stok:
            print("No stock found!")
            return
            
        ilac = db.query(Ilac).filter(Ilac.id == stok.ilac_id).first()
        print(f"\nTesting with medicine: {ilac.ad} (barkod: {ilac.barkod})")
        
        # Test the repository
        repo = EczaneRepository(db)
        
        print("\n=== WITHOUT LOCATION FILTER ===")
        results_no_filter = repo.find_eczaneler_with_stock([str(ilac.id)])
        print(f"Total pharmacies found: {len(results_no_filter)}")
        for eczane, stok_info in results_no_filter[:3]:
            print(f"  {eczane.eczane_adi}: il={eczane.il}")
        
        print(f"\n=== WITH LOCATION FILTER (il={hasta.il}) ===")
        results_with_filter = repo.find_eczaneler_with_stock(
            [str(ilac.id)],
            hasta_mahalle=hasta.mahalle,
            hasta_ilce=hasta.ilce,
            hasta_il=hasta.il
        )
        print(f"Filtered pharmacies found: {len(results_with_filter)}")
        for eczane, stok_info in results_with_filter:
            print(f"  {eczane.eczane_adi}: il={eczane.il}, ilce={eczane.ilce}, mahalle={eczane.mahalle}")
        
        # Check if filtering is working
        if hasta.il:
            all_same_city = all(e[0].il.lower() == hasta.il.lower() for e in results_with_filter if e[0].il)
            if all_same_city:
                print(f"\n✅ SUCCESS: All filtered pharmacies are in {hasta.il}")
            else:
                print(f"\n❌ FAIL: Some pharmacies are NOT in {hasta.il}")
        else:
            print("\n⚠️ Patient has no il set!")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_filtering()
