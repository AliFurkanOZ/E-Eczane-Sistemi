"""
Test İlaç Schemas and Repository

Tests for drug schemas and database operations
"""
import pytest
from decimal import Decimal
from sqlalchemy.orm import Session
import time
from app.models.ilac import Ilac, MuadilIlac
from app.models.stok import Stok
from app.models.eczane import Eczane
from app.models.user import User
from app.schemas.ilac import (
    IlacCreate,
    IlacUpdate,
    IlacSearchParams,
    IlacResponse,
    IlacSearchResponse,
)
from app.repositories.ilac_repository import IlacRepository
from app.utils.enums import IlacKategori, UserType, OnayDurumu
from app.core.database import SessionLocal
from app.core.security import get_password_hash


@pytest.fixture(scope="function")
def db_session():
    """Database session fixture"""
    db = SessionLocal()
    try:
        yield db
    finally:
        # Cleanup - remove test data in correct order
        try:
            db.rollback()  # Rollback any pending transactions
            db.query(MuadilIlac).delete()
            db.query(Stok).delete()
            db.query(Ilac).filter(Ilac.barkod.like('%TEST%')).delete()
            db.query(Ilac).filter(Ilac.barkod.in_([
                '8699546325789', '1111111111111', '2222222222222', '3333333333333'
            ])).delete()
            db.query(Eczane).delete()
            db.query(User).filter(User.email.like('%test%')).delete()
            db.commit()
        except Exception as e:
            db.rollback()
        finally:
            db.close()


@pytest.fixture
def sample_ilac_data():
    """Sample drug data for testing with unique barkod"""
    timestamp = str(int(time.time() * 1000))[-10:]  # Last 10 digits of timestamp
    return {
        "barkod": f"TEST{timestamp}",
        "ad": "Parol 500mg 20 Tablet",
        "kategori": IlacKategori.NORMAL,
        "kullanim_talimati": "Günde 3 defa 1 tablet alınız. Yemeklerden sonra kullanınız.",
        "fiyat": Decimal("45.50"),
        "receteli": False,
        "etken_madde": "Parasetamol",
        "firma": "Atabay İlaç",
        "prospektus_url": "https://example.com/parol-prospektus.pdf"
    }


@pytest.fixture
def sample_eczane(db_session):
    """Create sample pharmacy for testing"""
    # Create user first
    user = User(
        email="test.eczane@example.com",
        password_hash=get_password_hash("test123"),
        user_type=UserType.ECZANE,
        is_active=True
    )
    db_session.add(user)
    db_session.flush()
    
    # Create pharmacy
    eczane = Eczane(
        user_id=user.id,
        sicil_no="TEST123",
        eczane_adi="Test Eczanesi",
        adres="Test Adres",
        telefon="5551234567",
        mahalle="Test Mahalle",
        eczaci_adi="Test",
        eczaci_soyadi="Eczacı",
        eczaci_diploma_no="TEST123",
        banka_hesap_no="1234567890",
        iban="TR330006100519786457841326",
        onay_durumu=OnayDurumu.ONAYLANDI
    )
    db_session.add(eczane)
    db_session.commit()
    db_session.refresh(eczane)
    
    return eczane


# ============================================================
# SCHEMA TESTS
# ============================================================

def test_ilac_create_schema(sample_ilac_data):
    """Test İlaç creation schema validation"""
    print("\n" + "🧪 ILAC CREATE SCHEMA TEST ".center(60, "="))
    
    ilac_schema = IlacCreate(**sample_ilac_data)
    
    assert ilac_schema.barkod.startswith("TEST")
    assert ilac_schema.ad == "Parol 500mg 20 Tablet"
    assert ilac_schema.kategori == IlacKategori.NORMAL
    assert ilac_schema.fiyat == Decimal("45.50")
    assert ilac_schema.receteli is False
    assert ilac_schema.etken_madde == "Parasetamol"
    
    print("✅ İlaç create schema validation başarılı!")


def test_ilac_create_schema_validation():
    """Test İlaç schema field validations"""
    print("\n" + "🧪 ILAC SCHEMA VALIDATION TEST ".center(60, "="))
    
    # Test minimum price validation
    with pytest.raises(ValueError):
        IlacCreate(
            barkod="123",
            ad="Test İlaç",
            kategori=IlacKategori.NORMAL,
            kullanim_talimati="Test talimati",
            fiyat=Decimal("-10.00"),  # Negative price
            receteli=False
        )
    
    # Test minimum field length
    with pytest.raises(ValueError):
        IlacCreate(
            barkod="",  # Empty barkod
            ad="Test İlaç",
            kategori=IlacKategori.NORMAL,
            kullanim_talimati="Test talimati",
            fiyat=Decimal("10.00"),
            receteli=False
        )
    
    print("✅ İlaç schema validations başarılı!")


def test_ilac_search_params():
    """Test search parameters schema"""
    print("\n" + "🧪 ILAC SEARCH PARAMS TEST ".center(60, "="))
    
    params = IlacSearchParams(
        query="parol",
        kategori=IlacKategori.NORMAL,
        receteli=False,
        min_fiyat=Decimal("10.00"),
        max_fiyat=Decimal("100.00"),
        page=1,
        page_size=20
    )
    
    assert params.query == "parol"
    assert params.kategori == IlacKategori.NORMAL
    assert params.page == 1
    assert params.page_size == 20
    
    print("✅ Search params schema validation başarılı!")


# ============================================================
# REPOSITORY TESTS
# ============================================================

def test_ilac_repository_create(db_session, sample_ilac_data):
    """Test creating a drug"""
    print("\n" + "🧪 ILAC REPOSITORY CREATE TEST ".center(60, "="))
    
    repo = IlacRepository(db_session)
    ilac_schema = IlacCreate(**sample_ilac_data)
    
    ilac = repo.create(ilac_schema)
    
    assert ilac.id is not None
    assert ilac.barkod == sample_ilac_data["barkod"]
    assert ilac.ad == "Parol 500mg 20 Tablet"
    assert ilac.fiyat == Decimal("45.50")
    assert ilac.aktif is True
    
    print(f"✅ İlaç oluşturuldu: {ilac.ad}")


def test_ilac_repository_get_by_id(db_session, sample_ilac_data):
    """Test getting drug by ID"""
    print("\n" + "🧪 ILAC REPOSITORY GET BY ID TEST ".center(60, "="))
    
    repo = IlacRepository(db_session)
    ilac_schema = IlacCreate(**sample_ilac_data)
    created_ilac = repo.create(ilac_schema)
    
    # Get by ID
    found_ilac = repo.get_by_id(str(created_ilac.id))
    
    assert found_ilac is not None
    assert found_ilac.id == created_ilac.id
    assert found_ilac.ad == created_ilac.ad
    
    print(f"✅ İlaç bulundu: {found_ilac.ad}")


def test_ilac_repository_get_by_barkod(db_session, sample_ilac_data):
    """Test getting drug by barcode"""
    print("\n" + "🧪 ILAC REPOSITORY GET BY BARKOD TEST ".center(60, "="))
    
    repo = IlacRepository(db_session)
    ilac_schema = IlacCreate(**sample_ilac_data)
    created_ilac = repo.create(ilac_schema)
    
    # Get by barkod
    found_ilac = repo.get_by_barkod(sample_ilac_data["barkod"])
    
    assert found_ilac is not None
    assert found_ilac.barkod == sample_ilac_data["barkod"]
    
    print(f"✅ İlaç barkod ile bulundu: {found_ilac.barkod}")


def test_ilac_repository_update(db_session, sample_ilac_data):
    """Test updating a drug"""
    print("\n" + "🧪 ILAC REPOSITORY UPDATE TEST ".center(60, "="))
    
    repo = IlacRepository(db_session)
    ilac_schema = IlacCreate(**sample_ilac_data)
    created_ilac = repo.create(ilac_schema)
    
    # Update
    update_data = IlacUpdate(
        ad="Parol 500mg 30 Tablet",
        fiyat=Decimal("65.00")
    )
    updated_ilac = repo.update(str(created_ilac.id), update_data)
    
    assert updated_ilac is not None
    assert updated_ilac.ad == "Parol 500mg 30 Tablet"
    assert updated_ilac.fiyat == Decimal("65.00")
    assert updated_ilac.barkod == sample_ilac_data["barkod"]  # Unchanged
    
    print(f"✅ İlaç güncellendi: {updated_ilac.ad}, Fiyat: {updated_ilac.fiyat}")


def test_ilac_repository_search(db_session):
    """Test searching drugs"""
    print("\n" + "🧪 ILAC REPOSITORY SEARCH TEST ".center(60, "="))
    
    repo = IlacRepository(db_session)
    timestamp = str(int(time.time() * 1000))[-10:]
    
    # Create multiple drugs with unique barkods
    drugs = [
        IlacCreate(
            barkod=f"TST{timestamp}001",
            ad="Aspirin 100mg",
            kategori=IlacKategori.NORMAL,
            kullanim_talimati="Günde 1 tablet",
            fiyat=Decimal("25.00"),
            receteli=False
        ),
        IlacCreate(
            barkod=f"TST{timestamp}002",
            ad="Parol 500mg",
            kategori=IlacKategori.NORMAL,
            kullanim_talimati="Günde 3 tablet",
            fiyat=Decimal("45.00"),
            receteli=False
        ),
        IlacCreate(
            barkod=f"TST{timestamp}003",
            ad="Antibiyotik X",
            kategori=IlacKategori.KIRMIZI_RECETE,
            kullanim_talimati="Günde 2 tablet",
            fiyat=Decimal("120.00"),
            receteli=True
        ),
    ]
    
    for drug in drugs:
        repo.create(drug)
    
    # Search by name
    params = IlacSearchParams(query="parol", page=1, page_size=10)
    results, total = repo.search(params)
    
    assert total >= 1  # At least our test drug
    assert len(results) >= 1
    # Check that our test drug is in results
    assert any("Parol" in result.ad for result in results)
    
    # Search by category
    params = IlacSearchParams(kategori=IlacKategori.NORMAL, page=1, page_size=10)
    results, total = repo.search(params)
    
    assert total >= 2  # At least our 2 test drugs
    assert len(results) >= 2
    
    # Search by prescription requirement
    params = IlacSearchParams(receteli=True, page=1, page_size=10)
    results, total = repo.search(params)
    
    assert total >= 1  # At least our test prescription drug
    if len(results) > 0:
        assert any(result.receteli is True for result in results)
    
    print(f"✅ Arama testleri başarılı! Toplam {total} ilaç bulundu")


def test_ilac_repository_muadil(db_session):
    """Test drug alternatives (muadil)"""
    print("\n" + "🧪 ILAC REPOSITORY MUADIL TEST ".center(60, "="))
    
    repo = IlacRepository(db_session)
    timestamp = str(int(time.time() * 1000))[-10:]
    
    # Create main drug
    main_drug = repo.create(IlacCreate(
        barkod=f"MUADIL{timestamp}001",
        ad="Parol 500mg",
        kategori=IlacKategori.NORMAL,
        kullanim_talimati="Günde 3 tablet",
        fiyat=Decimal("45.00"),
        receteli=False,
        etken_madde="Parasetamol"
    ))
    
    # Create alternative drug
    alt_drug = repo.create(IlacCreate(
        barkod=f"MUADIL{timestamp}002",
        ad="Minoset 500mg",
        kategori=IlacKategori.NORMAL,
        kullanim_talimati="Günde 3 tablet",
        fiyat=Decimal("38.00"),
        receteli=False,
        etken_madde="Parasetamol"
    ))
    
    # Add alternative
    repo.add_muadil(str(main_drug.id), str(alt_drug.id))
    
    # Get alternatives
    muadiller = repo.get_muadiller(str(main_drug.id))
    
    assert len(muadiller) == 1
    assert muadiller[0].id == alt_drug.id
    
    print(f"✅ Muadil eklendi: {alt_drug.ad}")
    
    # Remove alternative
    success = repo.remove_muadil(str(main_drug.id), str(alt_drug.id))
    assert success is True
    
    muadiller = repo.get_muadiller(str(main_drug.id))
    assert len(muadiller) == 0
    
    print("✅ Muadil kaldırıldı")


def test_ilac_repository_with_stok(db_session, sample_ilac_data, sample_eczane):
    """Test getting drug with stock information"""
    print("\n" + "🧪 ILAC REPOSITORY WITH STOK TEST ".center(60, "="))
    
    repo = IlacRepository(db_session)
    ilac_schema = IlacCreate(**sample_ilac_data)
    ilac = repo.create(ilac_schema)
    
    # Create stock
    stok = Stok(
        eczane_id=sample_eczane.id,
        ilac_id=ilac.id,
        miktar=50,
        min_stok=10
    )
    db_session.add(stok)
    db_session.commit()
    
    # Get drug with stock
    found_ilac, found_stok = repo.get_with_stok(str(ilac.id), str(sample_eczane.id))
    
    assert found_ilac is not None
    assert found_stok is not None
    assert found_stok.miktar == 50
    assert found_stok.stok_durumu == "yeterli"
    
    print(f"✅ İlaç stok ile bulundu: Miktar={found_stok.miktar}, Durum={found_stok.stok_durumu}")


def test_ilac_repository_delete(db_session, sample_ilac_data):
    """Test soft deleting a drug"""
    print("\n" + "🧪 ILAC REPOSITORY DELETE TEST ".center(60, "="))
    
    repo = IlacRepository(db_session)
    ilac_schema = IlacCreate(**sample_ilac_data)
    ilac = repo.create(ilac_schema)
    
    # Delete (soft delete)
    success = repo.delete(str(ilac.id))
    assert success is True
    
    # Should not be found (aktif=False)
    found_ilac = repo.get_by_id(str(ilac.id))
    assert found_ilac is None
    
    print("✅ İlaç soft delete başarılı")


# ============================================================
# MAIN TEST RUNNER
# ============================================================

if __name__ == "__main__":
    print("\n" + "🧪 İLAÇ SCHEMA VE REPOSITORY TESTLERİ ".center(60, "="))
    print("\nTüm testleri çalıştırmak için: pytest tests/test_ilac.py -v")
    print("\n" + "=" * 60)
