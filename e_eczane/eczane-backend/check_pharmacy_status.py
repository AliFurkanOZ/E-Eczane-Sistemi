#!/usr/bin/env python3
"""
Eczane kullanıcısının onay durumunu kontrol eden script
"""

import os
import sys
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.eczane import Eczane
from app.utils.enums import OnayDurumu

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def check_pharmacy_status():
    """Eczane kullanıcısının onay durumunu kontrol et"""
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        # Eczane kullanıcılarını kontrol et
        print("--- Eczane Kullanıcıları ve Onay Durumları ---")
        eczaneler = db.query(Eczane).join(User).all()
        for eczane in eczaneler:
            print(f"  Sicil No: {eczane.sicil_no}")
            print(f"  Email: {eczane.user.email}")
            print(f"  Onay Durumu: {eczane.onay_durumu}")
            print(f"  Aktif Mi: {eczane.user.is_active}")
            print("")
            
            # Onayla
            if eczane.onay_durumu != OnayDurumu.ONAYLANDI:
                print(f"  ⚠️  {eczane.sicil_no} onaylanıyor...")
                eczane.onay_durumu = OnayDurumu.ONAYLANDI
                eczane.onay_notu = "Test için otomatik onaylandı"
        
        # Commit changes
        db.commit()
        print("✅ Eczane kullanıcıları onaylandı!")
            
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    check_pharmacy_status()