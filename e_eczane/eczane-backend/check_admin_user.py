#!/usr/bin/env python3
"""
Admin kullanıcısının detaylarını kontrol eden script
"""

import os
import sys
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.utils.enums import UserType

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def check_admin_user():
    """Admin kullanıcısının detaylarını kontrol et"""
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        # Admin kullanıcısını bul
        admin_user = db.query(User).filter(
            User.email == "admin@eczane.com"
        ).first()
        
        if admin_user:
            print("✅ Admin kullanıcısı bulundu:")
            print(f"  Email: {admin_user.email}")
            print(f"  User Type: {admin_user.user_type}")
            print(f"  Is Active: {admin_user.is_active}")
            print(f"  ID: {admin_user.id}")
        else:
            print("❌ Admin kullanıcısı bulunamadı")
            
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin_user()