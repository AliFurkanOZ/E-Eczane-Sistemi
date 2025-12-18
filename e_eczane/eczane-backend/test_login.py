# -*- coding: utf-8 -*-
"""Test login via HTTP request"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 50)
print("DOKTOR LOGIN TESTI (HTTP)")
print("=" * 50)

# Login request
print("\nLogin denemesi...")
try:
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "identifier": "test.doktor@hospital.com",
        "password": "Test123!",
        "user_type": "doktor"
    })
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"Hata: {e}")

print("\n" + "=" * 50)