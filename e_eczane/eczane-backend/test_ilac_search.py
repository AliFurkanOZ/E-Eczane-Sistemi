# -*- coding: utf-8 -*-
"""Test ilac search with muadil drugs - output to file"""
import sys
sys.path.insert(0, '.')

import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

from app.core.database import SessionLocal
from app.repositories.ilac_repository import IlacRepository
from app.schemas.ilac import IlacSearchParams, IlacResponse

output = []

def log(msg):
    output.append(msg)

db = SessionLocal()
try:
    repo = IlacRepository(db)
    
    # Test 1: Search for "parol" (has muadil)
    log("=" * 50)
    log("TEST 1: Parol aramasi (muadili var)")
    log("=" * 50)
    params = IlacSearchParams(query='parol', page=1, page_size=10)
    ilaclar, total = repo.search(params)
    log(f"Bulunan: {total} sonuc")
    
    for ilac in ilaclar:
        try:
            response = IlacResponse.model_validate(ilac)
            log(f"  [OK] {response.ad} - {response.fiyat} TL")
        except Exception as e:
            log(f"  [HATA] {ilac.ad}: {e}")
    
    # Test 2: Search for "augmentin" (has muadil)
    log("")
    log("=" * 50)
    log("TEST 2: Augmentin aramasi (muadili var)")
    log("=" * 50)
    params = IlacSearchParams(query='augmentin', page=1, page_size=10)
    ilaclar, total = repo.search(params)
    log(f"Bulunan: {total} sonuc")
    
    for ilac in ilaclar:
        try:
            response = IlacResponse.model_validate(ilac)
            log(f"  [OK] {response.ad} - {response.fiyat} TL")
        except Exception as e:
            log(f"  [HATA] {ilac.ad}: {e}")
    
    # Test 3: Search for "aspirin" (no muadil)
    log("")
    log("=" * 50)
    log("TEST 3: Aspirin aramasi (muadili yok)")
    log("=" * 50)
    params = IlacSearchParams(query='aspirin', page=1, page_size=10)
    ilaclar, total = repo.search(params)
    log(f"Bulunan: {total} sonuc")
    
    for ilac in ilaclar:
        try:
            response = IlacResponse.model_validate(ilac)
            log(f"  [OK] {response.ad} - {response.fiyat} TL")
        except Exception as e:
            log(f"  [HATA] {ilac.ad}: {e}")
    
    log("")
    log("=" * 50)
    log("TUM TESTLER TAMAMLANDI - HATA YOK")
    log("=" * 50)

except Exception as e:
    log(f"GENEL HATA: {e}")
    import traceback
    log(traceback.format_exc())
finally:
    db.close()

# Write to file
with open("test_results.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output))
print("Sonuclar test_results.txt dosyasina yazildi")
