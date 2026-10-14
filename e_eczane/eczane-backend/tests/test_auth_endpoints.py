"""
Auth Router Testleri
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.schemas.hasta import HastaCreate
from app.schemas.eczane import EczaneCreate
from app.schemas.user import UserType
from app.services.auth_service import AuthService
from app.core.security import get_password_hash
from app.utils.enums import OnayDurumu
from app.models import User, Hasta, Eczane


@pytest.fixture(scope="module", autouse=True)
def setup_test_data(db_session: Session):
    """Test verilerini oluştur ve temizle"""
    # Mevcut verileri temizle
    db_session.query(Hasta).delete()
    db_session.query(Eczane).delete()
    db_session.query(User).delete()
    db_session.commit()

    auth_service = AuthService(db_session)

    # Admin kullanıcısı oluştur
    admin_user = User(
        email="admin@test.com",
        password_hash=get_password_hash("AdminTest123!"),
        user_type=UserType.ADMIN,
        is_active=True
    )
    db_session.add(admin_user)
    
    # Onaylı Eczane kullanıcısı oluştur
    onayli_eczane_data = EczaneCreate(
        email="onayli.eczane@test.com",
        password="EczaneTest123!",
        sicil_no="ECZANE123",
        eczane_adi="Onaylı Test Eczanesi",
        adres="Onaylı Adres",
        telefon="5551112233",
        mahalle="Test Mahallesi",
        eczaci_adi="Ahmet",
        eczaci_soyadi="Yılmaz",
        eczaci_diploma_no="12345",
        banka_hesap_no="1234567890",
        iban="TR330006100519786457841326"
    )
    onayli_eczane_db = auth_service.register_eczane(onayli_eczane_data)
    onayli_eczane_db.onay_durumu = OnayDurumu.ONAYLANDI

    # Onay bekleyen Eczane kullanıcısı oluştur
    bekleyen_eczane_data = EczaneCreate(
        email="bekleyen.eczane@test.com",
        password="EczaneTest123!",
        sicil_no="ECZANE456",
        eczane_adi="Bekleyen Test Eczanesi",
        adres="Bekleyen Adres",
        telefon="5554445566",
        mahalle="Test Mahallesi 2",
        eczaci_adi="Ayşe",
        eczaci_soyadi="Kaya",
        eczaci_diploma_no="67890",
        banka_hesap_no="0987654321",
        iban="TR330006100519786457841327"
    )
    auth_service.register_eczane(bekleyen_eczane_data)

    # Hasta kullanıcısı oluştur
    hasta_data = HastaCreate(
        email="hasta@test.com",
        password="HastaTest123!",
        tc_no="11111111111",
        ad="Test",
        soyad="Hasta",
        adres="Test Adres",
        telefon="5559998877"
    )
    auth_service.register_hasta(hasta_data)
    
    db_session.commit()
    yield
    # Testlerden sonra verileri tekrar temizle
    db_session.query(Hasta).delete()
    db_session.query(Eczane).delete()
    db_session.query(User).delete()
    db_session.commit()


def test_root_endpoint(client: TestClient):
    """Root endpoint'in doğru yanıt verdiğini test et."""
    response = client.get("/")
    assert response.status_code == 200
    # The actual response contains more keys, so we check for the presence and value of 'message'
    assert response.json()["message"] == "Eczane Yönetim Sistemi API"

def test_hasta_registration(client: TestClient):
    """Yeni bir hasta kaydının başarılı olup olmadığını test et."""
    response = client.post("/api/auth/register/hasta", json={
        "email": "yeni_hasta@test.com",
        "password": "YeniHasta123!",
        "tc_no": "22222222222",
        "ad": "Yeni",
        "soyad": "Hasta",
        "adres": "Yeni Adres",
        "telefon": "5551231212"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["tc_no"] == "22222222222"
    assert "id" in data

def test_eczane_registration(client: TestClient):
    """Yeni bir eczane kaydının başarılı olup olmadığını test et."""
    response = client.post("/api/auth/register/eczane", json={
        "email": "yeni.eczane@test.com",
        "password": "YeniEczane123!",
        "sicil_no": "YENI123",
        "eczane_adi": "Yeni Eczane",
        "adres": "Yeni Adres",
        "telefon": "5557778899",
        "mahalle": "Yeni Mahalle",
        "eczaci_adi": "Fatma",
        "eczaci_soyadi": "Öztürk",
        "eczaci_diploma_no": "54321",
        "banka_hesap_no": "1122334455",
        "iban": "TR330006100519786457841328"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["eczane_adi"] == "Yeni Eczane"
    assert data["onay_durumu"] == "beklemede"

def test_hasta_login_with_email(client: TestClient):
    """Hasta kullanıcısının e-posta ile giriş yapabildiğini test et."""
    response = client.post("/api/auth/login", json={
        "identifier": "hasta@test.com",
        "password": "HastaTest123!",
        "user_type": "hasta"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_hasta_login_with_tc(client: TestClient):
    """Hasta kullanıcısının TC kimlik numarası ile giriş yapabildiğini test et."""
    response = client.post("/api/auth/login", json={
        "identifier": "11111111111",
        "password": "HastaTest123!",
        "user_type": "hasta"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_eczane_login_approved(client: TestClient):
    """Onaylanmış eczane kullanıcısının giriş yapabildiğini test et."""
    response = client.post("/api/auth/login", json={
        "identifier": "onayli.eczane@test.com",
        "password": "EczaneTest123!",
        "user_type": "eczane"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_eczane_login_pending(client: TestClient):
    """Onay bekleyen eczane kullanıcısının giriş yapamadığını test et."""
    response = client.post("/api/auth/login", json={
        "identifier": "bekleyen.eczane@test.com",
        "password": "EczaneTest123!",
        "user_type": "eczane"
    })
    assert response.status_code == 403 
    assert "henüz onaylanmadı" in response.json()["detail"]

def test_wrong_password(client: TestClient):
    """Yanlış şifre ile giriş yapılamadığını test et."""
    response = client.post("/api/auth/login", json={
        "identifier": "hasta@test.com",
        "password": "WrongPassword!",
        "user_type": "hasta"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Kullanıcı adı veya şifre hatalı"

def test_get_current_user(client: TestClient):
    """Geçerli bir token ile kullanıcı bilgilerinin alınabildiğini test et."""
    login_res = client.post("/api/auth/login", json={
        "identifier": "hasta@test.com",
        "password": "HastaTest123!",
        "user_type": "hasta"
    })
    token = login_res.json()["access_token"]
    
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "hasta@test.com"
    assert data["user_type"] == "hasta"

def test_unauthorized_access(client: TestClient):
    """Yetkisiz (token olmadan) erişimin engellendiğini test et."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

def test_swagger_docs(client: TestClient):
    """Swagger UI'nin erişilebilir olduğunu test et."""
    response = client.get("/docs")
    assert response.status_code == 200

def test_redoc(client: TestClient):
    """ReDoc UI'nin erişilebilir olduğunu test et."""
    response = client.get("/redoc")
    assert response.status_code == 200
