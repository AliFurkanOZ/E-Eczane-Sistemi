"""
Test Authentication Schemas
Bu script authentication schema'larının doğru çalıştığını test eder
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.schemas.auth import UserLogin, Token, TokenRefresh, PasswordChange
from app.schemas.user import UserCreate, UserResponse
from app.schemas.hasta import HastaCreate, HastaUpdate, HastaResponse
from app.schemas.eczane import EczaneCreate, EczaneUpdate, EczaneResponse
from app.utils.enums import UserType, OnayDurumu
from datetime import datetime


def test_user_login_schema():
    """UserLogin schema testi"""
    print("\n" + "="*60)
    print("🔐 USER LOGIN SCHEMA TEST")
    print("="*60)
    
    try:
        # Valid login
        login_data = {
            "identifier": "12345678901",
            "password": "SecurePass123!",
            "user_type": "hasta"
        }
        login = UserLogin(**login_data)
        print(f"✅ Valid login schema: {login.identifier} ({login.user_type.value})")
        
        # Test with email
        login_email = UserLogin(
            identifier="test@example.com",
            password="password123",
            user_type=UserType.ECZANE
        )
        print(f"✅ Email login: {login_email.identifier}")
        
        print("✅ UserLogin schema testi başarılı!")
        return True
    except Exception as e:
        print(f"❌ UserLogin schema hatası: {e}")
        return False


def test_token_schema():
    """Token schema testi"""
    print("\n" + "="*60)
    print("🎫 TOKEN SCHEMA TEST")
    print("="*60)
    
    try:
        token_data = {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user_type": UserType.HASTA,
            "user_id": "123e4567-e89b-12d3-a456-426614174000"
        }
        token = Token(**token_data)
        print(f"✅ Token schema: {token.token_type} - {token.user_type.value}")
        print(f"   Access Token: {token.access_token[:30]}...")
        
        print("✅ Token schema testi başarılı!")
        return True
    except Exception as e:
        print(f"❌ Token schema hatası: {e}")
        return False


def test_password_change_schema():
    """PasswordChange schema testi"""
    print("\n" + "="*60)
    print("🔑 PASSWORD CHANGE SCHEMA TEST")
    print("="*60)
    
    try:
        # Valid password change
        pwd_data = {
            "old_password": "OldPass123!",
            "new_password": "NewPass123!",
            "new_password_confirm": "NewPass123!"
        }
        pwd_change = PasswordChange(**pwd_data)
        print(f"✅ Valid password change schema")
        
        # Test password strength validation
        try:
            weak_pwd = PasswordChange(
                old_password="OldPass123!",
                new_password="weak",
                new_password_confirm="weak"
            )
            print("❌ Zayıf şifre kabul edildi (olmamalıydı)")
            return False
        except ValueError as e:
            print(f"✅ Zayıf şifre reddedildi: {e}")
        
        # Test password mismatch
        try:
            mismatch_pwd = PasswordChange(
                old_password="OldPass123!",
                new_password="NewPass123!",
                new_password_confirm="DifferentPass123!"
            )
            print("❌ Eşleşmeyen şifreler kabul edildi (olmamalıydı)")
            return False
        except ValueError as e:
            print(f"✅ Eşleşmeyen şifreler reddedildi: {e}")
        
        print("✅ PasswordChange schema testi başarılı!")
        return True
    except Exception as e:
        print(f"❌ PasswordChange schema hatası: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_hasta_schema():
    """Hasta schema testi"""
    print("\n" + "="*60)
    print("👤 HASTA SCHEMA TEST")
    print("="*60)
    
    try:
        # Valid hasta create
        hasta_data = {
            "tc_no": "12345678901",
            "ad": "Ahmet",
            "soyad": "Yılmaz",
            "adres": "Atatürk Cad. No:123 Çankaya/ANKARA",
            "telefon": "05551234567",
            "email": "ahmet@example.com",
            "password": "SecurePass123!"
        }
        hasta = HastaCreate(**hasta_data)
        print(f"✅ Hasta create schema: {hasta.ad} {hasta.soyad}")
        print(f"   TC No: {hasta.tc_no}")
        print(f"   Email: {hasta.email}")
        
        # Test TC No validation
        try:
            invalid_tc = HastaCreate(
                tc_no="123",  # Too short
                ad="Test",
                soyad="User",
                adres="Test Address 123456",
                telefon="05551234567",
                email="test@example.com",
                password="pass123"
            )
            print("❌ Geçersiz TC No kabul edildi (olmamalıydı)")
            return False
        except ValueError as e:
            print(f"✅ Geçersiz TC No reddedildi: {e}")
        
        # Hasta update schema
        update_data = {
            "ad": "Mehmet",
            "telefon": "05559876543"
        }
        hasta_update = HastaUpdate(**update_data)
        print(f"✅ Hasta update schema: {hasta_update.ad}")
        
        print("✅ Hasta schema testi başarılı!")
        return True
    except Exception as e:
        print(f"❌ Hasta schema hatası: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_eczane_schema():
    """Eczane schema testi"""
    print("\n" + "="*60)
    print("🏥 ECZANE SCHEMA TEST")
    print("="*60)
    
    try:
        # Valid eczane create
        eczane_data = {
            "sicil_no": "ANK123456",
            "eczane_adi": "Şifa Eczanesi",
            "adres": "Kızılay Meydanı No:45 Çankaya/ANKARA",
            "telefon": "03121234567",
            "mahalle": "Kızılay",
            "eczaci_adi": "Mehmet",
            "eczaci_soyadi": "Demir",
            "eczaci_diploma_no": "ECZ123456",
            "banka_hesap_no": "1234567890",
            "iban": "TR330006100519786457841326",
            "email": "sifa@eczane.com",
            "password": "SecurePass123!"
        }
        eczane = EczaneCreate(**eczane_data)
        print(f"✅ Eczane create schema: {eczane.eczane_adi}")
        print(f"   Sicil No: {eczane.sicil_no}")
        print(f"   Eczacı: {eczane.eczaci_adi} {eczane.eczaci_soyadi}")
        print(f"   IBAN: {eczane.iban}")
        
        # Test IBAN validation
        try:
            invalid_iban = EczaneCreate(
                **{**eczane_data, "iban": "US1234567890"}  # Wrong country code
            )
            print("❌ Geçersiz IBAN kabul edildi (olmamalıydı)")
            return False
        except ValueError as e:
            print(f"✅ Geçersiz IBAN reddedildi: {e}")
        
        # Test IBAN with spaces (should be cleaned)
        eczane_with_spaces = EczaneCreate(
            **{**eczane_data, "iban": "TR33 0006 1005 1978 6457 8413 26"}
        )
        print(f"✅ IBAN boşluklarla temizlendi: {eczane_with_spaces.iban}")
        
        # Eczane update schema
        update_data = {
            "eczane_adi": "Yeni Şifa Eczanesi",
            "telefon": "03129876543"
        }
        eczane_update = EczaneUpdate(**update_data)
        print(f"✅ Eczane update schema: {eczane_update.eczane_adi}")
        
        print("✅ Eczane schema testi başarılı!")
        return True
    except Exception as e:
        print(f"❌ Eczane schema hatası: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_schema_imports():
    """Schema import testi"""
    print("\n" + "="*60)
    print("📦 SCHEMA IMPORTS TEST")
    print("="*60)
    
    try:
        from app.schemas import (
            UserLogin, Token, TokenRefresh, PasswordChange,
            UserBase, UserCreate, UserResponse, UserInDB,
            HastaBase, HastaCreate, HastaUpdate, HastaResponse,
            EczaneBase, EczaneCreate, EczaneUpdate, EczaneResponse
        )
        print("✅ Tüm schema'lar başarıyla import edildi")
        print(f"   • Auth schemas: UserLogin, Token, TokenRefresh, PasswordChange")
        print(f"   • User schemas: UserBase, UserCreate, UserResponse, UserInDB")
        print(f"   • Hasta schemas: HastaBase, HastaCreate, HastaUpdate, HastaResponse")
        print(f"   • Eczane schemas: EczaneBase, EczaneCreate, EczaneUpdate, EczaneResponse")
        return True
    except Exception as e:
        print(f"❌ Import hatası: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n" + "🧪 PYDANTIC SCHEMAS TEST ".center(60, "="))
    
    results = []
    
    # Run all tests
    results.append(("Schema Imports", test_schema_imports()))
    results.append(("UserLogin", test_user_login_schema()))
    results.append(("Token", test_token_schema()))
    results.append(("PasswordChange", test_password_change_schema()))
    results.append(("Hasta Schemas", test_hasta_schema()))
    results.append(("Eczane Schemas", test_eczane_schema()))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SONUÇLARI")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ BAŞARILI" if result else "❌ BAŞARISIZ"
        print(f"{test_name:.<40} {status}")
    
    print("="*60)
    print(f"Toplam: {passed}/{total} test başarılı")
    
    if passed == total:
        print("\n🎉 TÜM TESTLER BAŞARILI!")
        sys.exit(0)
    else:
        print(f"\n⚠️ {total - passed} test başarısız!")
        sys.exit(1)
