"""
ADIM 5.3: Eczane Router - Test ve Doğrulama
============================================

Test: Endpoint'lerin API'ye kayıtlı olduğunu doğrula
"""
import pytest
from fastapi.testclient import TestClient

def test_eczane_router_endpoints(client: TestClient):
    """OpenAPI şemasını kontrol ederek eczane endpoint'lerinin doğru şekilde kaydedildiğini doğrular."""
    response = client.get("/openapi.json")
    assert response.status_code == 200, "OpenAPI şeması alınamadı"
    
    schema = response.json()
    paths = schema.get("paths", {})
    
    # Beklenen eczane endpoint'leri
    expected_endpoints = [
        "/api/eczane/profil",
        "/api/eczane/stoklar",
        "/api/eczane/stoklar/uyarilar",
        "/api/eczane/stoklar/{stok_id}",
        "/api/eczane/urun-ekle",
        "/api/eczane/siparisler",
        "/api/eczane/siparisler/{siparis_id}",
        "/api/eczane/siparisler/{siparis_id}/durum",
        "/api/eczane/siparisler/{siparis_id}/iptal",
    ]
    
    found_endpoints = [endpoint for endpoint in expected_endpoints if endpoint in paths]
    
    assert len(found_endpoints) == len(expected_endpoints), \
        f"Tüm eczane endpoint'leri bulunamadı. Eksik olanlar: {set(expected_endpoints) - set(found_endpoints)}"

    # Eczane tag'i kontrolü
    tags = schema.get("tags", [])
    print(tags)
    assert any(tag.get("name") == "Eczane" for tag in tags), "'Eczane' tag'i bulunamadı"
