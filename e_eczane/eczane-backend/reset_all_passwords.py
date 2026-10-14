#!/usr/bin/env python3
"""
Tüm kullanıcı şifrelerini resetleme script'i
"""

import os
import sys
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.core.security import get_password_hash

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def reset_all_passwords():
    """Tüm kullanıcı şifrelerini resetle"""
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        # Hasta kullanıcısını bul ve şifresini resetle
        hasta_user = db.query(User).filter(
            User.email == "test@hasta.com"
        ).first()
        
        if hasta_user:
            print("✅ Hasta kullanıcısı bulundu")
            hasta_user.password_hash = get_password_hash("Test123!")
            print("✅ Hasta şifresi güncellendi")
        else:
            print("❌ Hasta kullanıcısı bulunamadı")
        
        # Eczane kullanıcısını bul ve şifresini resetle
        eczane_user = db.query(User).filter(
            User.email == "test@eczane.com"
        ).first()
        
        if eczane_user:
            print("✅ Eczane kullanıcısı bulundu")
            eczane_user.password_hash = get_password_hash("Test123!")
            print("✅ Eczane şifresi güncellendi")
        else:
            print("❌ Eczane kullanıcısı bulunamadı")
        
        # Commit changes
        db.commit()
        print("\n🎉 Tüm şifreler başarıyla güncellendi!")
            
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_all_passwords()