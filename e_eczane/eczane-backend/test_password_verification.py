#!/usr/bin/env python3
"""
Şifre doğrulama fonksiyonunu test eden script
"""

import os
import sys
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.core.security import verify_password, get_password_hash

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_password_verification():
    """Şifre doğrulama fonksiyonunu test et"""
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        # Admin kullanıcısını bul
        admin_user = db.query(User).filter(User.email == "admin@eczane.com").first()
        if admin_user:
            print(f"✅ Admin kullanıcısı bulundu: {admin_user.email}")
            print(f"  Hash: {admin_user.password_hash[:20]}...")
            
            # Şifre doğrulama testi
            plain_password = "Admin123!"
            is_valid = verify_password(plain_password, admin_user.password_hash)
            print(f"  '{plain_password}' şifresi doğru mu? {'✅ Evet' if is_valid else '❌ Hayır'}")
            
            # Yanlış şifre testi
            wrong_password = "WrongPassword!"
            is_valid_wrong = verify_password(wrong_password, admin_user.password_hash)
            print(f"  '{wrong_password}' şifresi doğru mu? {'✅ Evet' if is_valid_wrong else '❌ Hayır'}")
        else:
            print("❌ Admin kullanıcısı bulunamadı")
        
        # Hasta kullanıcısını bul
        hasta_user = db.query(User).filter(User.email == "test@hasta.com").first()
        if hasta_user:
            print(f"\n✅ Hasta kullanıcısı bulundu: {hasta_user.email}")
            print(f"  Hash: {hasta_user.password_hash[:20]}...")
            
            # Şifre doğrulama testi
            plain_password = "Test123!"
            is_valid = verify_password(plain_password, hasta_user.password_hash)
            print(f"  '{plain_password}' şifresi doğru mu? {'✅ Evet' if is_valid else '❌ Hayır'}")
        else:
            print("❌ Hasta kullanıcısı bulunamadı")
        
        # Eczane kullanıcısını bul
        eczane_user = db.query(User).filter(User.email == "test@eczane.com").first()
        if eczane_user:
            print(f"\n✅ Eczane kullanıcısı bulundu: {eczane_user.email}")
            print(f"  Hash: {eczane_user.password_hash[:20]}...")
            
            # Şifre doğrulama testi
            plain_password = "Test123!"
            is_valid = verify_password(plain_password, eczane_user.password_hash)
            print(f"  '{plain_password}' şifresi doğru mu? {'✅ Evet' if is_valid else '❌ Hayır'}")
        else:
            print("❌ Eczane kullanıcısı bulunamadı")
            
        # Hash fonksiyonu testi
        print(f"\n--- Hash Fonksiyonu Testi ---")
        test_password = "Test123!"
        hashed_password = get_password_hash(test_password)
        print(f"  Orijinal şifre: {test_password}")
        print(f"  Hash: {hashed_password[:20]}...")
        is_valid = verify_password(test_password, hashed_password)
        print(f"  Doğrulama: {'✅ Başarılı' if is_valid else '❌ Başarısız'}")
            
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_password_verification()