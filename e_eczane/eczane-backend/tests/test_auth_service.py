"""
Test Authentication Service
Bu script authentication service'in doğru çalıştığını test eder
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import SessionLocal, engine
from app.services.auth_service import AuthService
from app.schemas.auth import UserLogin
from app.schemas.hasta import HastaCreate
from app.schemas.eczane import EczaneCreate
from app.models import User, Hasta, Eczane
from app.utils.enums import UserType, OnayDurumu
from fastapi import HTTPException


def cleanup_test_data():
    """Test verilerini temizle"""
    db = SessionLocal()
    try:
        # Test kullanıcılarını sil
        db.execute(text("DELETE FROM hastalar WHERE tc_no = '99999999999'"))
        db.execute(text("DELETE FROM eczaneler WHERE sicil_no = 'TEST123456'"))
        db.execute(text("DELETE FROM users WHERE email IN ('test.hasta@example.com', 'test.eczane@example.com')"))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"⚠️ Cleanup error (ignored): {e}")
    finally:
        db.close()


def test_service_initialization():
    """Service başlatma testi"""
    print("\n" + "="*60)
    print("🔧 SERVICE INITIALIZATION TEST")
    print("="*60)
    
    try:
        db = SessionLocal()
        auth_service = AuthService(db)
        print("✅ AuthService başarıyla oluşturuldu")
        db.close()
        return True
    except Exception as e:
        print(f"❌ Service başlatma hatası: {e}")
        return False


def test_hasta_registration():
    """Hasta kaydı testi"""
    print("\n" + "="*60)
    print("👤 HASTA REGISTRATION TEST")
    print("="*60)
    
    db = SessionLocal()
    auth_service = AuthService(db)
    
    try:
        # Hasta verisi
        hasta_data = HastaCreate(
            tc_no="99999999999",
            ad="Test",
            soyad="Hasta",
            adres="Test Adres 123456789",
            telefon="05551234567",
            email="test.hasta@example.com",
            password="TestPass123!"
        )
        
        # Kayıt
        hasta = auth_service.register_hasta(hasta_data)
        
        print(f"✅ Hasta kaydı başarılı:")
        print(f"   • ID: {hasta.id}")
        print(f"   • TC No: {hasta.tc_no}")
        print(f"   • Ad Soyad: {hasta.tam_ad}")
        print(f"   • Email: {hasta_data.email}")
        
        # Veritabanında kontrol
        db_user = db.query(User).filter(User.email == hasta_data.email).first()
        assert db_user is not None, "User kaydı bulunamadı"
        assert db_user.user_type == UserType.HASTA, "User type hatalı"
        assert db_user.is_active == True, "User aktif değil"
        print(f"   • User Type: {db_user.user_type.value}")
        print(f"   • Active: {db_user.is_active}")
        
        # Duplicate kayıt testi
        try:
            duplicate = auth_service.register_hasta(hasta_data)
            print("❌ Duplicate email kabul edildi (olmamalıydı)")
            db.close()
            return False
        except HTTPException as e:
            print(f"✅ Duplicate email reddedildi: {e.detail}")
        
        db.close()
        print("✅ Hasta registration testi başarılı!")
        return True
        
    except Exception as e:
        db.rollback()
        db.close()
        print(f"❌ Hasta registration hatası: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_eczane_registration():
    """Eczane kaydı testi"""
    print("\n" + "="*60)
    print("🏥 ECZANE REGISTRATION TEST")
    print("="*60)
    
    db = SessionLocal()
    auth_service = AuthService(db)
    
    try:
        # Eczane verisi
        eczane_data = EczaneCreate(
            sicil_no="TEST123456",
            eczane_adi="Test Eczanesi",
            adres="Test Mahallesi Test Caddesi No:123",
            telefon="03121234567",
            mahalle="Test Mahallesi",
            eczaci_adi="Test",
            eczaci_soyadi="Eczacı",
            eczaci_diploma_no="TESTDIP123",
            banka_hesap_no="1234567890",
            iban="TR330006100519786457841326",
            email="test.eczane@example.com",
            password="TestPass123!"
        )
        
        # Kayıt
        eczane = auth_service.register_eczane(eczane_data)
        
        print(f"✅ Eczane kaydı başarılı:")
        print(f"   • ID: {eczane.id}")
        print(f"   • Sicil No: {eczane.sicil_no}")
        print(f"   • Eczane Adı: {eczane.eczane_adi}")
        print(f"   • Eczacı: {eczane.eczaci_tam_ad}")
        print(f"   • Onay Durumu: {eczane.onay_durumu.value}")
        
        # Onay durumu kontrolü
        assert eczane.onay_durumu == OnayDurumu.BEKLEMEDE, "Onay durumu BEKLEMEDE olmalı"
        print(f"✅ Onay durumu doğru: {eczane.onay_durumu.value}")
        
        # Veritabanında kontrol
        db_user = db.query(User).filter(User.email == eczane_data.email).first()
        assert db_user is not None, "User kaydı bulunamadı"
        assert db_user.user_type == UserType.ECZANE, "User type hatalı"
        print(f"   • User Type: {db_user.user_type.value}")
        
        db.close()
        print("✅ Eczane registration testi başarılı!")
        return True
        
    except Exception as e:
        db.rollback()
        db.close()
        print(f"❌ Eczane registration hatası: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_login_with_email():
    """Email ile login testi"""
    print("\n" + "="*60)
    print("🔐 LOGIN WITH EMAIL TEST")
    print("="*60)
    
    db = SessionLocal()
    auth_service = AuthService(db)
    
    try:
        # Hasta login
        login_data = UserLogin(
            identifier="test.hasta@example.com",
            password="TestPass123!",
            user_type=UserType.HASTA
        )
        
        token = auth_service.login(login_data)
        
        print(f"✅ Hasta login başarılı:")
        print(f"   • Token Type: {token.token_type}")
        print(f"   • User Type: {token.user_type.value}")
        print(f"   • User ID: {token.user_id}")
        print(f"   • Access Token: {token.access_token[:50]}...")
        print(f"   • Refresh Token: {token.refresh_token[:50]}...")
        
        assert token.token_type == "bearer", "Token type hatalı"
        assert token.user_type == UserType.HASTA, "User type hatalı"
        
        db.close()
        print("✅ Email login testi başarılı!")
        return True
        
    except Exception as e:
        db.close()
        print(f"❌ Login hatası: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_login_with_tc_no():
    """TC No ile login testi"""
    print("\n" + "="*60)
    print("🔐 LOGIN WITH TC NO TEST")
    print("="*60)
    
    db = SessionLocal()
    auth_service = AuthService(db)
    
    try:
        # TC No ile login
        login_data = UserLogin(
            identifier="99999999999",
            password="TestPass123!",
            user_type=UserType.HASTA
        )
        
        token = auth_service.login(login_data)
        
        print(f"✅ TC No ile login başarılı:")
        print(f"   • Identifier: {login_data.identifier} (TC No)")
        print(f"   • User Type: {token.user_type.value}")
        print(f"   • Access Token: {token.access_token[:50]}...")
        
        db.close()
        print("✅ TC No login testi başarılı!")
        return True
        
    except Exception as e:
        db.close()
        print(f"❌ TC No login hatası: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_login_with_wrong_password():
    """Yanlış şifre ile login testi"""
    print("\n" + "="*60)
    print("❌ WRONG PASSWORD TEST")
    print("="*60)
    
    db = SessionLocal()
    auth_service = AuthService(db)
    
    try:
        login_data = UserLogin(
            identifier="test.hasta@example.com",
            password="WrongPassword123!",
            user_type=UserType.HASTA
        )
        
        token = auth_service.login(login_data)
        
        print("❌ Yanlış şifre kabul edildi (olmamalıydı)")
        db.close()
        return False
        
    except HTTPException as e:
        print(f"✅ Yanlış şifre reddedildi:")
        print(f"   • Status: {e.status_code}")
        print(f"   • Detail: {e.detail}")
        db.close()
        return True
    except Exception as e:
        db.close()
        print(f"❌ Beklenmeyen hata: {e}")
        return False


def test_eczane_login_with_pending_approval():
    """Onay bekleyen eczane login testi"""
    print("\n" + "="*60)
    print("⏳ ECZANE PENDING APPROVAL LOGIN TEST")
    print("="*60)
    
    db = SessionLocal()
    auth_service = AuthService(db)
    
    try:
        # Eczane login (onay beklemede)
        login_data = UserLogin(
            identifier="test.eczane@example.com",
            password="TestPass123!",
            user_type=UserType.ECZANE
        )
        
        token = auth_service.login(login_data)
        
        print("❌ Onay bekleyen eczane login olabildi (olmamalıydı)")
        db.close()
        return False
        
    except HTTPException as e:
        print(f"✅ Onay bekleyen eczane reddedildi:")
        print(f"   • Status: {e.status_code}")
        print(f"   • Detail: {e.detail}")
        
        # Eczaneyi onayla
        eczane = db.query(Eczane).filter(Eczane.sicil_no == "TEST123456").first()
        eczane.onay_durumu = OnayDurumu.ONAYLANDI
        db.commit()
        db.expire(eczane) # Nesneyi expire ederek session'ın yeniden okumasını sağla
        print(f"✅ Eczane onaylandı: {eczane.onay_durumu.value}")
        
        # Tekrar login dene
        try:
            token = auth_service.login(login_data)
            print(f"✅ Onaylı eczane başarıyla login oldu:")
            print(f"   • User Type: {token.user_type.value}")
            db.close()
            return True
        except Exception as login_error:
            print(f"❌ Onaylı eczane login hatası: {login_error}")
            db.close()
            return False
            
    except Exception as e:
        db.close()
        print(f"❌ Beklenmeyen hata: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_login_with_sicil_no():
    """Sicil No ile login testi"""
    print("\n" + "="*60)
    print("🔐 LOGIN WITH SICIL NO TEST")
    print("="*60)
    
    db = SessionLocal()
    auth_service = AuthService(db)
    
    try:
        # Sicil No ile login
        login_data = UserLogin(
            identifier="TEST123456",
            password="TestPass123!",
            user_type=UserType.ECZANE
        )
        
        token = auth_service.login(login_data)
        
        print(f"✅ Sicil No ile login başarılı:")
        print(f"   • Identifier: {login_data.identifier} (Sicil No)")
        print(f"   • User Type: {token.user_type.value}")
        print(f"   • Access Token: {token.access_token[:50]}...")
        
        db.close()
        print("✅ Sicil No login testi başarılı!")
        return True
        
    except Exception as e:
        db.close()
        print(f"❌ Sicil No login hatası: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n" + "🧪 AUTHENTICATION SERVICE TEST ".center(60, "="))
    
    # Cleanup önce
    print("\n🧹 Cleaning up test data...")
    cleanup_test_data()
    
    results = []
    
    # Run all tests
    results.append(("Service Initialization", test_service_initialization()))
    results.append(("Hasta Registration", test_hasta_registration()))
    results.append(("Eczane Registration", test_eczane_registration()))
    results.append(("Login with Email", test_login_with_email()))
    results.append(("Login with TC No", test_login_with_tc_no()))
    results.append(("Login with Wrong Password", test_login_with_wrong_password()))
    results.append(("Eczane Pending Approval", test_eczane_login_with_pending_approval()))
    results.append(("Login with Sicil No", test_login_with_sicil_no()))
    
    # Cleanup sonra
    print("\n🧹 Cleaning up test data...")
    cleanup_test_data()
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SONUÇLARI")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ BAŞARILI" if result else "❌ BAŞARISIZ"
        print(f"{test_name:.<45} {status}")
    
    print("="*60)
    print(f"Toplam: {passed}/{total} test başarılı")
    
    if passed == total:
        print("\n🎉 TÜM TESTLER BAŞARILI!")
        print("\n💡 AuthService şunları yapabiliyor:")
        print("   ✅ Hasta kaydı (email ve TC No kontrolü ile)")
        print("   ✅ Eczane kaydı (onay beklemede)")
        print("   ✅ Email ile login")
        print("   ✅ TC No ile login")
        print("   ✅ Sicil No ile login")
        print("   ✅ Şifre kontrolü")
        print("   ✅ Eczane onay durumu kontrolü")
        print("   ✅ JWT token oluşturma")
        sys.exit(0)
    else:
        print(f"\n⚠️ {total - passed} test başarısız!")
        sys.exit(1)
