#!/usr/bin/env python3
"""
Login test script
"""

import requests
import json

def test_login():
    """Test login for different user types"""
    
    # Test data
    test_cases = [
        {
            "name": "Admin Login",
            "data": {
                "identifier": "admin@eczane.com",
                "password": "Admin123!",
                "user_type": "admin"
            }
        },
        {
            "name": "Hasta Login",
            "data": {
                "identifier": "12345678901",
                "password": "SecurePass123!",
                "user_type": "hasta"
            }
        },
        {
            "name": "Eczane Login",
            "data": {
                "identifier": "TEST123456",
                "password": "Test123!",
                "user_type": "eczane"
            }
        }
    ]
    
    url = "http://localhost:8000/api/auth/login"
    
    for case in test_cases:
        print(f"\n--- {case['name']} ---")
        try:
            response = requests.post(url, json=case['data'])
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                print("✅ Başarılı")
                print(f"Token: {response.json().get('access_token')[:20]}...")
            else:
                print(f"❌ Hata: {response.text}")
        except Exception as e:
            print(f"❌ Bağlantı hatası: {e}")

if __name__ == "__main__":
    test_login()