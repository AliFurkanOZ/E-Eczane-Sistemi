# -*- coding: utf-8 -*-
"""Yeni eczanelere stok ekle - sadece eksik stoklari ekler"""
import sys
import random
sys.path.insert(0, '.')

import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

from app.core.database import SessionLocal
from app.models.ilac import Ilac
from app.models.stok import Stok
from app.models.eczane import Eczane
from app.utils.enums import OnayDurumu

db = SessionLocal()
try:
    print("=" * 60)
    print("YENI ECZANELERE STOK EKLENIYOR...")
    print("=" * 60)
    
    # Onayli eczaneleri al
    eczaneler = db.query(Eczane).filter(Eczane.onay_durumu == OnayDurumu.ONAYLANDI).all()
    ilaclar = db.query(Ilac).filter(Ilac.aktif == True).all()
    
    print(f"\nToplam {len(eczaneler)} eczane, {len(ilaclar)} ilac")
    print("-" * 60)
    
    stok_count = 0
    for eczane in eczaneler:
        eczane_stok = 0
        for ilac in ilaclar:
            # Mevcut stok kontrol
            existing = db.query(Stok).filter(
                Stok.eczane_id == eczane.id,
                Stok.ilac_id == ilac.id
            ).first()
            
            if existing:
                continue
            
            stok = Stok(
                eczane_id=eczane.id,
                ilac_id=ilac.id,
                miktar=random.randint(10, 100),
                min_stok=5
            )
            db.add(stok)
            stok_count += 1
            eczane_stok += 1
        
        if eczane_stok > 0:
            print(f"  [YENI] {eczane.eczane_adi}: {eczane_stok} ilac stok eklendi")
        else:
            print(f"  [OK] {eczane.eczane_adi}: Stoklar zaten mevcut")
    
    db.commit()
    
    print("-" * 60)
    print(f"\nTOPLAM {stok_count} yeni stok kaydi eklendi")
    print("=" * 60)

except Exception as e:
    print(f"HATA: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
