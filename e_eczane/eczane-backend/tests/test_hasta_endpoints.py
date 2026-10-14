import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models import User, Hasta, Ilac, Recete, ReceteIlac
from app.utils.enums import UserType
from decimal import Decimal
import datetime

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_hasta.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    """Create test client"""
    def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def hasta_user(db):
    """Create a test patient (hasta) user and associated data."""
    from app.core.security import get_password_hash
    user = User(
        email="test.hasta@example.com",
        password_hash=get_password_hash("Test123!"),
        user_type=UserType.HASTA,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    hasta = Hasta(
        user_id=user.id,
        tc_no="11111111111",
        ad="Test",
        soyad="Hasta",
        adres="Test Adres",
        telefon="5550001122"
    )
    db.add(hasta)
    db.commit()
    db.refresh(hasta)
    
    return user, hasta

@pytest.fixture
def hasta_token(hasta_user):
    """Create JWT token for the test patient."""
    user, _ = hasta_user
    token_data = {
        "user_id": str(user.id),
        "email": user.email,
        "user_type": user.user_type.value
    }
    return create_access_token(data=token_data)

@pytest.fixture
def test_data(db, hasta_user):
    """Create sample drugs and a prescription for testing."""
    _, hasta = hasta_user
    
    ilac1 = Ilac(ad="Parol", barkod="8699516090103", fiyat=Decimal("25.50"), kategori="normal", receteli=False, kullanim_talimati="Günde 3 defa")
    ilac2 = Ilac(ad="Aspirin", barkod="8699504010114", fiyat=Decimal("30.00"), kategori="normal", receteli=False, kullanim_talimati="Günde 1 defa")
    db.add_all([ilac1, ilac2])
    db.commit()

    recete = Recete(
        recete_no="RCTEST123",
        tc_no=hasta.tc_no,
        tarih=datetime.date.today(),
        doktor_adi="Dr. Smith"
    )
    db.add(recete)
    db.commit()
    
    recete_ilac1 = ReceteIlac(recete_id=recete.id, ilac_id=ilac1.id, miktar=1)
    recete_ilac2 = ReceteIlac(recete_id=recete.id, ilac_id=ilac2.id, miktar=2)
    db.add_all([recete_ilac1, recete_ilac2])
    db.commit()

    return {"ilac1": ilac1, "ilac2": ilac2, "recete": recete}


class TestHastaEndpoints:
    def test_get_profil(self, client, hasta_token):
        response = client.get("/api/hasta/profil", headers={"Authorization": f"Bearer {hasta_token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["tc_no"] == "11111111111"
        assert data["email"] == "test.hasta@example.com"

    def test_sorgula_recete_success(self, client, hasta_token, test_data, hasta_user):
        _, hasta = hasta_user
        recete = test_data["recete"]
        response = client.post(
            "/api/hasta/recete/sorgula",
            headers={"Authorization": f"Bearer {hasta_token}"},
            json={"recete_no": recete.recete_no, "tc_no": hasta.tc_no}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["recete_no"] == recete.recete_no
        assert len(data["ilac_listesi"]) == 2

    def test_sorgula_recete_not_found(self, client, hasta_token, hasta_user):
        _, hasta = hasta_user
        response = client.post(
            "/api/hasta/recete/sorgula",
            headers={"Authorization": f"Bearer {hasta_token}"},
            json={"recete_no": "NONEXISTENT", "tc_no": hasta.tc_no}
        )
        assert response.status_code == 404

    def test_ara_ilac_with_query(self, client, hasta_token, test_data):
        response = client.get("/api/hasta/ilac/ara?query=Parol", headers={"Authorization": f"Bearer {hasta_token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["ad"] == "Parol"

    def test_get_ilac_detay_success(self, client, hasta_token, test_data):
        ilac1_id = test_data["ilac1"].id
        response = client.get(f"/api/hasta/ilac/{ilac1_id}", headers={"Authorization": f"Bearer {hasta_token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["ad"] == "Parol"

    def test_get_ilac_detay_not_found(self, client, hasta_token):
        import uuid
        non_existent_id = uuid.uuid4()
        response = client.get(f"/api/hasta/ilac/{non_existent_id}", headers={"Authorization": f"Bearer {hasta_token}"})
        assert response.status_code == 404

    def test_list_my_receteler(self, client, hasta_token, test_data):
        response = client.get("/api/hasta/recetelerim", headers={"Authorization": f"Bearer {hasta_token}"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["recete_no"] == test_data["recete"].recete_no
