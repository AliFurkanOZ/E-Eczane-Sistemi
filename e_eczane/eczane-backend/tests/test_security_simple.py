"""Basit security test dosyası"""
import sys
import os

# Proje root'unu path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import (
    create_access_token,
    decode_access_token,
    create_refresh_token
)


def test_jwt_token():
    """JWT token test"""
    print("\n=== JWT Token Test ===")
    payload = {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com",
        "user_type": "hasta"
    }
    
    # Token oluştur
    token = create_access_token(payload)
    print(f"✅ Access Token oluşturuldu: {token[:50]}...")
    
    # Token decode et
    decoded = decode_access_token(token)
    print(f"✅ Token decode edildi")
    print(f"   - user_id: {decoded['user_id']}")
    print(f"   - email: {decoded['email']}")
    print(f"   - user_type: {decoded['user_type']}")
    
    assert decoded["user_id"] == payload["user_id"]
    assert decoded["email"] == payload["email"]
    assert decoded["user_type"] == payload["user_type"]
    print("✅ JWT token testi başarılı!")


def test_refresh_token():
    """Refresh token test"""
    print("\n=== Refresh Token Test ===")
    payload = {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com"
    }
    
    # Refresh token oluştur
    token = create_refresh_token(payload)
    print(f"✅ Refresh Token oluşturuldu: {token[:50]}...")
    
    # Token decode et
    decoded = decode_access_token(token)
    print(f"✅ Refresh token decode edildi")
    print(f"   - type: {decoded.get('type')}")
    assert decoded.get("type") == "refresh"
    print("✅ Refresh token testi başarılı!")


if __name__ == "__main__":
    try:
        test_jwt_token()
        test_refresh_token()
        print("\n🎉 Tüm JWT testleri başarılı!")
    except Exception as e:
        print(f"\n❌ Hata: {e}")
        import traceback
        traceback.print_exc()





