#!/usr/bin/env python3
"""
Eczane kullanıcılarını detaylı kontrol eden script
"""

import os
import sys
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.eczane import Eczane

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def detailed_pharmacy_check():
    """Eczane kullanıcılarını detaylı kontrol et"""
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        # Tüm kullanıcıları kontrol et
        print("--- Tüm Kullanıcılar ---")
        users = db.query(User).all()
        for user in users:
            print(f"  Email: {user.email}")
            print(f"  User Type: {user.user_type}")
            print(f"  Is Active: {user.is_active}")
            print("")
        
        # Eczane kullanıcılarını kontrol et
        print("--- Eczane Kullanıcıları ---")
        eczaneler = db.query(Eczane).all()
        for eczane in eczaneler:
            print(f"  Sicil No: {eczane.sicil_no}")
            print(f"  User ID: {eczane.user_id}")
            print(f"  Email: {eczane.user.email if eczane.user else 'User not found'}")
            print("")
            
        # ANK123456 kullanıcılarını ara
        print("--- ANK123456 Kullanıcısı ---")
        eczane_by_sicil = db.query(Eczane).filter(Eczane.sicil_no == "ANK123456").first()
        if eczane_by_sicil:
            print(f"  Sicil No: {eczane_by_sicil.sicil_no}")
            print(f"  User ID: {eczane_by_sicil.user_id}")
            print(f"  Email: {eczane_by_sicil.user.email if eczane_by_sicil.user else 'User not found'}")
        else:
            print("  ANK123456 sicil numarasına sahip eczane bulunamadı")
            
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    detailed_pharmacy_check()