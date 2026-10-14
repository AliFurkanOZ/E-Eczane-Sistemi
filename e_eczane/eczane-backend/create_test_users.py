#!/usr/bin/env python3
"""
Test kullanıcıları oluşturma script'i
"""

import os
import sys
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.hasta import Hasta
from app.models.eczane import Eczane
from app.core.security import get_password_hash
from app.utils.enums import UserType, OnayDurumu

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def create_test_users():
    """Test kullanıcılarını oluştur"""
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        # Test Hasta Kullanıcısı
        print("Test hasta kullanıcısı oluşturuluyor...")
        existing_user = db.query(User).filter(User.email == "test@hasta.com").first()
        if not existing_user:
            user = User(
                email="test@hasta.com",
                password_hash=get_password_hash("Test123!"),
                user_type=UserType.HASTA,
                is_active=True
            )
            db.add(user)
            db.flush()
            
            hasta = Hasta(
                user_id=user.id,
                tc_no="12345678902",
                ad="Test",
                soyad="Hasta",
                adres="Test Mahallesi, Test Sokak, No:1",
                telefon="05551234567"
            )
            db.add(hasta)
            print("✅ Test hasta kullanıcısı oluşturuldu")
        else:
            print("⚠️  Test hasta kullanıcısı zaten mevcut")
        
        # Test Eczane Kullanıcısı
        print("Test eczane kullanıcısı oluşturuluyor...")
        existing_user = db.query(User).filter(User.email == "test@eczane.com").first()
        if not existing_user:
            user = User(
                email="test@eczane.com",
                password_hash=get_password_hash("Test123!"),
                user_type=UserType.ECZANE,
                is_active=True
            )
            db.add(user)
            db.flush()
            
            eczane = Eczane(
                user_id=user.id,
                sicil_no="TEST123456",
                eczane_adi="Test Eczanesi",
                adres="Test Mahallesi, Test Sokak, No:2",
                telefon="03121234567",
                mahalle="Test Mahallesi",
                eczaci_adi="Test",
                eczaci_soyadi="Eczacı",
                eczaci_diploma_no="ECZ123456",
                banka_hesap_no="1234567890",
                iban="TR330006100519786457841326",
                onay_durumu=OnayDurumu.ONAYLANDI
            )
            db.add(eczane)
            print("✅ Test eczane kullanıcısı oluşturuldu")
        else:
            print("⚠️  Test eczane kullanıcısı zaten mevcut")
        
        # Commit changes
        db.commit()
        print("\n🎉 Tüm test kullanıcıları hazır!")
        
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()