"""
Test Eczane Router Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.user import User
from app.models.eczane import Eczane
from app.utils.enums import UserType, OnayDurumu


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_eczane.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create test client"""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def eczane_user(db):
    """Create test eczane user"""
    from app.core.security import get_password_hash
    
    # Create user
    user = User(
        email="test@eczane.com",
        password_hash=get_password_hash("Test123!"),
        user_type=UserType.ECZANE,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create eczane
    eczane = Eczane(
        user_id=user.id,
        sicil_no="TEST123",
        eczane_adi="Test Eczanesi",
        adres="Test Adres No:1 Test/TEST",
        telefon="05551234567",
        mahalle="Test Mahalle",
        eczaci_adi="Test",
        eczaci_soyadi="Eczacı",
        eczaci_diploma_no="ECZDIP123",
        banka_hesap_no="1234567890",
        iban="TR330006100519786457841326",
        onay_durumu=OnayDurumu.ONAYLANDI
    )
    db.add(eczane)
    db.commit()
    db.refresh(eczane)
    
    return user, eczane


@pytest.fixture
def eczane_token(eczane_user):
    """Create JWT token for eczane"""
    user, _ = eczane_user
    token_data = {
        "user_id": str(user.id),
        "email": user.email,
        "user_type": user.user_type.value
    }
    token = create_access_token(data=token_data)
    return token


def test_get_profil_success(client, eczane_token):
    """Test: Profil görüntüleme başarılı"""
    response = client.get(
        "/api/eczane/profil",
        headers={"Authorization": f"Bearer {eczane_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["eczane_adi"] == "Test Eczanesi"
    assert data["sicil_no"] == "TEST123"


def test_get_profil_unauthorized(client):
    """Test: Token olmadan profil görüntüleme - başarısız"""
    response = client.get("/api/eczane/profil")
    assert response.status_code == 401


def test_update_profil_success(client, eczane_token):
    """Test: Profil güncelleme başarılı"""
    response = client.put(
        "/api/eczane/profil",
        headers={"Authorization": f"Bearer {eczane_token}"},
        json={
            "telefon": "05559876543",
            "adres": "Yeni Adres No:2 Yeni/YENI"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["telefon"] == "05559876543"
    assert data["adres"] == "Yeni Adres No:2 Yeni/YENI"


def test_list_stoklar_empty(client, eczane_token):
    """Test: Boş stok listesi"""
    response = client.get(
        "/api/eczane/stoklar",
        headers={"Authorization": f"Bearer {eczane_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_get_stok_uyarilari_empty(client, eczane_token):
    """Test: Boş stok uyarıları"""
    response = client.get(
        "/api/eczane/stoklar/uyarilar",
        headers={"Authorization": f"Bearer {eczane_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_list_siparisler_empty(client, eczane_token):
    """Test: Boş sipariş listesi"""
    response = client.get(
        "/api/eczane/siparisler",
        headers={"Authorization": f"Bearer {eczane_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_list_siparisler_with_pagination(client, eczane_token):
    """Test: Sayfalama ile sipariş listesi"""
    response = client.get(
        "/api/eczane/siparisler?page=1&page_size=10",
        headers={"Authorization": f"Bearer {eczane_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_siparis_detay_not_found(client, eczane_token):
    """Test: Olmayan sipariş detayı - 404"""
    fake_siparis_id = "00000000-0000-0000-0000-000000000000"
    response = client.get(
        f"/api/eczane/siparisler/{fake_siparis_id}",
        headers={"Authorization": f"Bearer {eczane_token}"}
    )
    assert response.status_code == 404


def test_endpoints_require_authentication(client):
    """Test: Tüm endpoint'ler authentication gerektirir"""
    endpoints = [
        "/api/eczane/profil",
        "/api/eczane/stoklar",
        "/api/eczane/stoklar/uyarilar",
        "/api/eczane/siparisler",
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint)
        assert response.status_code == 401, f"{endpoint} should require authentication"


def test_eczane_user_type_required(client, db):
    """Test: Sadece eczane kullanıcıları erişebilir"""
    from app.core.security import get_password_hash
    
    # Create hasta user
    hasta_user = User(
        email="hasta@test.com",
        password_hash=get_password_hash("Test123!"),
        user_type=UserType.HASTA,
        is_active=True
    )
    db.add(hasta_user)
    db.commit()
    
    # Create token for hasta
    hasta_token = create_access_token(data={"user_id": str(hasta_user.id)})
    
    # Try to access eczane endpoint with hasta token
    response = client.get(
        "/api/eczane/profil",
        headers={"Authorization": f"Bearer {hasta_token}"}
    )
    assert response.status_code == 403  # Forbidden


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
