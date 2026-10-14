#!/usr/bin/env python3
"""
Orijinal kullanıcıları kontrol eden script
"""

import os
import sys
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.hasta import Hasta
from app.models.eczane import Eczane
from app.core.security import get_password_hash

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def check_and_reset_original_users():
    """Orijinal kullanıcıları kontrol et ve şifrelerini resetle"""
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        # Hasta kullanıcılarını kontrol et
        print("--- Hasta Kullanıcıları ---")
        hastalar = db.query(Hasta).join(User).all()
        for hasta in hastalar:
            print(f"  TC No: {hasta.tc_no}, Email: {hasta.user.email}")
            # Şifreyi resetle
            hasta.user.password_hash = get_password_hash("SecurePass123!")
        
        # Eczane kullanıcılarını kontrol et
        print("\n--- Eczane Kullanıcıları ---")
        eczaneler = db.query(Eczane).join(User).all()
        for eczane in eczaneler:
            print(f"  Sicil No: {eczane.sicil_no}, Email: {eczane.user.email}")
            # Şifreyi resetle
            eczane.user.password_hash = get_password_hash("SecurePass123!")
        
        # Commit changes
        db.commit()
        print("\n✅ Orijinal kullanıcı şifreleri güncellendi!")
            
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    check_and_reset_original_users()