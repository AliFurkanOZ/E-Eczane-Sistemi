#!/usr/bin/env python3
"""
Admin şifresini resetleme script'i
"""

import os
import sys
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.core.security import get_password_hash

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def reset_admin_password():
    """Admin şifresini resetle"""
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        # Admin kullanıcısını bul
        admin_user = db.query(User).filter(
            User.email == "admin@eczane.com"
        ).first()
        
        if admin_user:
            print("✅ Admin kullanıcısı bulundu")
            print(f"  Email: {admin_user.email}")
            print(f"  User Type: {admin_user.user_type}")
            
            # Şifreyi resetle
            new_password = "Admin123!"
            admin_user.password_hash = get_password_hash(new_password)
            db.commit()
            
            print(f"✅ Şifre başarıyla güncellendi")
            print(f"  Yeni şifre: {new_password}")
        else:
            print("❌ Admin kullanıcısı bulunamadı")
            
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()