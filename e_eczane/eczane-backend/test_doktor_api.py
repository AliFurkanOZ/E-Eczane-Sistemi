# -*- coding: utf-8 -*-
"""Test the doctor system API endpoints"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("DOKTOR SISTEMI API TESTI")
print("=" * 60)

# 1. Test doktor registration
print("\n[1] Doktor Kaydi Testi...")
try:
    response = requests.post(f"{BASE_URL}/api/auth/register/doktor", json={
        "email": "test.doktor@hospital.com",
        "password": "Test123!",
        "diploma_no": "DIP12345",
        "ad": "Mehmet",
        "soyad": "Oz",
        "uzmanlik": "Dahiliye",
        "hastane": "Ankara Hastanesi"
    })
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Response: {json.dumps(data, indent=2, ensure_ascii=False)[:500]}")
    
    if response.status_code == 201:
        print("   [OK] Doktor kaydi basarili!")
    elif response.status_code == 400 and "zaten" in str(data):
        print("   [OK] Doktor zaten kayitli (bu normal)")
    else:
        print(f"   [FAIL] Beklenmeyen hata: {data}")
except Exception as e:
    print(f"   [FAIL] Hata: {e}")

# 2. Test doktor login
print("\n[2] Doktor Giris Testi...")
try:
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "identifier": "test.doktor@hospital.com",
        "password": "Test123!",
        "user_type": "doktor"
    })
    print(f"   Status: {response.status_code}")
    data = response.json()
    
    if response.status_code == 200:
        token = data.get("access_token", "")
        print(f"   [OK] Giris basarili! Token alindi.")
        print(f"   User Type: {data.get('user_type')}")
    else:
        print(f"   [FAIL] Giris hatasi: {data}")
        token = None
except Exception as e:
    print(f"   [FAIL] Hata: {e}")
    token = None

# 3. Test doktor profile
if token:
    print("\n[3] Doktor Profil Testi...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/doktor/profil", headers=headers)
        print(f"   Status: {response.status_code}")
        data = response.json()
        
        if response.status_code == 200:
            print(f"   [OK] Profil alindi: {data.get('ad')} {data.get('soyad')}")
            print(f"   Diploma No: {data.get('diploma_no')}")
            print(f"   Hastane: {data.get('hastane')}")
        else:
            print(f"   [FAIL] Profil hatasi: {data}")
    except Exception as e:
        print(f"   [FAIL] Hata: {e}")

# 4. Test medicine search
if token:
    print("\n[4] Ilac Arama Testi...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/doktor/ilac/ara?query=Parol", headers=headers)
        print(f"   Status: {response.status_code}")
        data = response.json()
        
        if response.status_code == 200:
            items = data.get("items", [])
            print(f"   [OK] {len(items)} ilac bulundu")
            for item in items[:3]:
                print(f"      - {item.get('ad')} ({item.get('fiyat')} TL)")
        else:
            print(f"   [FAIL] Arama hatasi: {data}")
    except Exception as e:
        print(f"   [FAIL] Hata: {e}")

# 5. Test prescription creation
if token:
    print("\n[5] Recete Olusturma Testi...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/doktor/ilac/ara?query=Parol", headers=headers)
        ilac_data = response.json()
        
        if ilac_data.get("items"):
            ilac_id = ilac_data["items"][0]["id"]
            
            response = requests.post(f"{BASE_URL}/api/doktor/recete/yaz", headers=headers, json={
                "tc_no": "12345678901",
                "ilaclar": [
                    {"ilac_id": ilac_id, "miktar": 2, "kullanim_talimati": "Gunde 3 kez 1 tablet"}
                ]
            })
            print(f"   Status: {response.status_code}")
            data = response.json()
            
            if response.status_code == 201:
                print(f"   [OK] Recete olusturuldu!")
                print(f"   Recete No: {data.get('recete_no')}")
                print(f"   Hasta: {data.get('hasta_adi')}")
                print(f"   Toplam: {data.get('toplam_tutar')} TL")
            else:
                print(f"   [FAIL] Recete hatasi: {data}")
        else:
            print("   [WARN] Ilac bulunamadi, recete testi atlandi")
    except Exception as e:
        print(f"   [FAIL] Hata: {e}")

print("\n" + "=" * 60)
print("TEST TAMAMLANDI!")
print("=" * 60)
