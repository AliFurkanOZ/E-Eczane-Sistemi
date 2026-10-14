import sys
import os

# Proje root'unu path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token
)


def test_password_hashing():
    """Password hashing test"""
    password = "TestSifre123!"
    
    # Hash oluştur
    hashed = get_password_hash(password)
    print(f"Original: {password}")
    print(f"Hashed: {hashed}")
    
    # Verify
    assert verify_password(password, hashed) == True
    assert verify_password("YanlisSifre", hashed) == False
    print("✅ Password hashing çalışıyor!")




def test_jwt_token():
    """JWT token test"""
    payload = {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com",
        "user_type": "hasta"
    }
    
    # Token oluştur
    token = create_access_token(payload)
    print(f"\nToken: {token[:50]}...")
    
    # Token decode et
    decoded = decode_access_token(token)
    print(f"Decoded: {decoded}")
    
    assert decoded["user_id"] == payload["user_id"]
    assert decoded["email"] == payload["email"]
    assert decoded["user_type"] == payload["user_type"]
    print("✅ JWT token çalışıyor!")




if __name__ == "__main__":
    test_password_hashing()
    test_jwt_token()





