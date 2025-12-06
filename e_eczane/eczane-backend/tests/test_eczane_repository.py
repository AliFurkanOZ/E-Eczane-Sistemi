import pytest
from sqlalchemy.orm import Session
from decimal import Decimal
import time
from app.core.database import SessionLocal
from app.repositories.eczane_repository import EczaneRepository
from app.models.eczane import Eczane
from app.models.user import User
from app.models.ilac import Ilac
from app.models.stok import Stok
from app.utils.enums import UserType, OnayDurumu, IlacKategori


@pytest.fixture(scope="function")
def db_session():
    """Database session fixture"""
    db = SessionLocal()
    try:
        yield db
    finally:
        # Cleanup
        try:
            db.rollback()
            # Clean test data
            db.query(Stok).filter(
                Stok.eczane_id.in_(
                    db.query(Eczane.id).filter(Eczane.sicil_no.like('%TEST%'))
                )
            ).delete(synchronize_session=False)
            db.query(Eczane).filter(Eczane.sicil_no.like('%TEST%')).delete(synchronize_session=False)
            db.query(User).filter(User.email.like('%test_eczane%')).delete(synchronize_session=False)
            db.query(Ilac).filter(Ilac.barkod.like('%TESTECZ%')).delete(synchronize_session=False)
            db.commit()
        except Exception as e:
            print(f"Cleanup error: {e}")
            db.rollback()
        finally:
            db.close()


@pytest.fixture
def eczane_repository(db_session):
    """EczaneRepository fixture"""
    return EczaneRepository(db_session)


@pytest.fixture
def sample_eczane_data(db_session):
    """Create sample eczane with user"""
    timestamp = str(int(time.time() * 1000))[-8:]
    
    # Create user
    user = User(
        email=f"test_eczane_{timestamp}@example.com",
        password_hash="hashed_password",
        user_type=UserType.ECZANE,
        is_active=True
    )
    db_session.add(user)
    db_session.flush()
    
    # Create eczane
    eczane = Eczane(
        user_id=user.id,
        sicil_no=f"TEST{timestamp}",
        eczane_adi=f"Test Eczane {timestamp}",
        adres="Test Adres 123",
        telefon="5551234567",
        mahalle="Çankaya",
        eczaci_adi="Ahmet",
        eczaci_soyadi="Yılmaz",
        eczaci_diploma_no="12345",
        banka_hesap_no="1234567890",
        iban="TR123456789012345678901234",
        onay_durumu=OnayDurumu.ONAYLANDI
    )
    db_session.add(eczane)
    db_session.commit()
    db_session.refresh(eczane)
    
    return eczane, user


@pytest.fixture
def sample_ilac_data(db_session):
    """Create sample ilac for testing"""
    timestamp = str(int(time.time() * 1000))[-8:]
    
    ilac = Ilac(
        barkod=f"TESTECZ{timestamp}",
        ad="Test İlaç",
        kategori=IlacKategori.NORMAL,
        fiyat=Decimal("50.00"),
        kullanim_talimati="Test talimat",
        receteli=False,
        aktif=True
    )
    db_session.add(ilac)
    db_session.commit()
    db_session.refresh(ilac)
    
    return ilac


class TestEczaneRepository:
    """Test Eczane Repository"""
    
    def test_get_by_id(self, eczane_repository, sample_eczane_data, db_session):
        """Test get pharmacy by ID"""
        eczane, user = sample_eczane_data
        
        result = eczane_repository.get_by_id(str(eczane.id))
        
        assert result is not None
        assert result.id == eczane.id
        assert result.eczane_adi == eczane.eczane_adi
        assert result.onay_durumu == OnayDurumu.ONAYLANDI
    
    def test_get_by_id_pending_not_returned(self, eczane_repository, db_session):
        """Test that pending pharmacies are not returned by get_by_id"""
        timestamp = str(int(time.time() * 1000))[-8:]
        
        user = User(
            email=f"test_pending_{timestamp}@example.com",
            password_hash="hashed",
            user_type=UserType.ECZANE,
            is_active=True
        )
        db_session.add(user)
        db_session.flush()
        
        eczane = Eczane(
            user_id=user.id,
            sicil_no=f"TESTPEND{timestamp}",
            eczane_adi="Pending Eczane",
            adres="Test Adres",
            telefon="5551234567",
            mahalle="Test",
            eczaci_adi="Test",
            eczaci_soyadi="Test",
            eczaci_diploma_no="123",
            banka_hesap_no="123",
            iban="TR123",
            onay_durumu=OnayDurumu.BEKLEMEDE  # Pending status
        )
        db_session.add(eczane)
        db_session.commit()
        
        # Should not be returned
        result = eczane_repository.get_by_id(str(eczane.id))
        assert result is None
    
    def test_get_by_user_id(self, eczane_repository, sample_eczane_data):
        """Test get pharmacy by user ID"""
        eczane, user = sample_eczane_data
        
        result = eczane_repository.get_by_user_id(str(user.id))
        
        assert result is not None
        assert result.user_id == user.id
        assert result.eczane_adi == eczane.eczane_adi
    
    def test_get_aktif_eczaneler(self, eczane_repository, sample_eczane_data):
        """Test get active pharmacies"""
        eczane, user = sample_eczane_data
        
        results = eczane_repository.get_aktif_eczaneler()
        
        # Should include at least our test pharmacy
        assert len(results) >= 1
        assert any(e.id == eczane.id for e in results)
        
        # All should be approved and active
        for e in results:
            assert e.onay_durumu == OnayDurumu.ONAYLANDI
            assert e.user.is_active == True
    
    def test_get_by_mahalle(self, eczane_repository, sample_eczane_data):
        """Test get pharmacies by neighborhood"""
        eczane, user = sample_eczane_data
        
        results = eczane_repository.get_by_mahalle("Çankaya")
        
        assert len(results) >= 1
        assert any(e.id == eczane.id for e in results)
        
        # All should be in Çankaya
        for e in results:
            assert e.mahalle == "Çankaya"
    
    def test_find_eczaneler_with_stock_no_location(
        self, eczane_repository, sample_eczane_data, sample_ilac_data, db_session
    ):
        """Test finding pharmacies with stock (no location preference)"""
        eczane, user = sample_eczane_data
        ilac = sample_ilac_data
        
        # Add stock
        stok = Stok(
            eczane_id=eczane.id,
            ilac_id=ilac.id,
            miktar=10,
            min_stok=5
        )
        db_session.add(stok)
        db_session.commit()
        
        # Search
        results = eczane_repository.find_eczaneler_with_stock([str(ilac.id)])
        
        assert len(results) >= 1
        
        # Check structure
        eczane_found, stok_info = results[0]
        assert eczane_found.id == eczane.id
        assert str(ilac.id) in stok_info
        assert stok_info[str(ilac.id)]["miktar"] == 10
        assert stok_info[str(ilac.id)]["stok_durumu"] == "yeterli"
    
    def test_find_eczaneler_with_stock_same_mahalle_first(
        self, eczane_repository, sample_ilac_data, db_session
    ):
        """Test that same neighborhood pharmacies are listed first"""
        ilac = sample_ilac_data
        timestamp = str(int(time.time() * 1000))[-8:]
        
        # Create 2 pharmacies in different neighborhoods
        # Pharmacy 1 - Çankaya (same as patient)
        user1 = User(
            email=f"test_mahalle1_{timestamp}@example.com",
            password_hash="hash",
            user_type=UserType.ECZANE,
            is_active=True
        )
        db_session.add(user1)
        db_session.flush()
        
        eczane1 = Eczane(
            user_id=user1.id,
            sicil_no=f"TESTMAH1{timestamp}",
            eczane_adi="Çankaya Eczane",
            adres="Adres 1",
            telefon="5551111111",
            mahalle="Çankaya",
            eczaci_adi="Ali",
            eczaci_soyadi="Veli",
            eczaci_diploma_no="111",
            banka_hesap_no="111",
            iban="TR111",
            onay_durumu=OnayDurumu.ONAYLANDI
        )
        db_session.add(eczane1)
        db_session.flush()
        
        # Pharmacy 2 - Keçiören (different)
        user2 = User(
            email=f"test_mahalle2_{timestamp}@example.com",
            password_hash="hash",
            user_type=UserType.ECZANE,
            is_active=True
        )
        db_session.add(user2)
        db_session.flush()
        
        eczane2 = Eczane(
            user_id=user2.id,
            sicil_no=f"TESTMAH2{timestamp}",
            eczane_adi="Keçiören Eczane",
            adres="Adres 2",
            telefon="5552222222",
            mahalle="Keçiören",
            eczaci_adi="Mehmet",
            eczaci_soyadi="Yıldız",
            eczaci_diploma_no="222",
            banka_hesap_no="222",
            iban="TR222",
            onay_durumu=OnayDurumu.ONAYLANDI
        )
        db_session.add(eczane2)
        db_session.flush()
        
        # Add stock to both
        stok1 = Stok(eczane_id=eczane1.id, ilac_id=ilac.id, miktar=5)
        stok2 = Stok(eczane_id=eczane2.id, ilac_id=ilac.id, miktar=10)
        db_session.add_all([stok1, stok2])
        db_session.commit()
        
        # Search with hasta_mahalle = Çankaya
        results = eczane_repository.find_eczaneler_with_stock(
            [str(ilac.id)],
            hasta_mahalle="Çankaya"
        )
        
        assert len(results) >= 2
        
        # First result should be from Çankaya
        first_eczane, _ = results[0]
        assert first_eczane.mahalle == "Çankaya"
    
    def test_find_eczaneler_zero_stock_not_included(
        self, eczane_repository, sample_eczane_data, sample_ilac_data, db_session
    ):
        """Test that pharmacies with zero stock are not included"""
        eczane, user = sample_eczane_data
        ilac = sample_ilac_data
        
        # Add zero stock
        stok = Stok(
            eczane_id=eczane.id,
            ilac_id=ilac.id,
            miktar=0  # Zero stock
        )
        db_session.add(stok)
        db_session.commit()
        
        # Search
        results = eczane_repository.find_eczaneler_with_stock([str(ilac.id)])
        
        # Should not include pharmacy with zero stock
        eczane_ids = [e.id for e, _ in results]
        assert eczane.id not in eczane_ids
    
    def test_check_stock_availability_sufficient(
        self, eczane_repository, sample_eczane_data, sample_ilac_data, db_session
    ):
        """Test stock availability check - sufficient stock"""
        eczane, user = sample_eczane_data
        ilac = sample_ilac_data
        
        # Add stock
        stok = Stok(
            eczane_id=eczane.id,
            ilac_id=ilac.id,
            miktar=10
        )
        db_session.add(stok)
        db_session.commit()
        
        # Check availability
        is_sufficient, eksik = eczane_repository.check_stock_availability(
            str(eczane.id),
            {str(ilac.id): 5}  # Request 5, have 10
        )
        
        assert is_sufficient == True
        assert len(eksik) == 0
    
    def test_check_stock_availability_insufficient(
        self, eczane_repository, sample_eczane_data, sample_ilac_data, db_session
    ):
        """Test stock availability check - insufficient stock"""
        eczane, user = sample_eczane_data
        ilac = sample_ilac_data
        
        # Add insufficient stock
        stok = Stok(
            eczane_id=eczane.id,
            ilac_id=ilac.id,
            miktar=3
        )
        db_session.add(stok)
        db_session.commit()
        
        # Check availability
        is_sufficient, eksik = eczane_repository.check_stock_availability(
            str(eczane.id),
            {str(ilac.id): 10}  # Request 10, have only 3
        )
        
        assert is_sufficient == False
        assert len(eksik) == 1
        assert str(ilac.id) in eksik
        assert eksik[str(ilac.id)]["istenen"] == 10
        assert eksik[str(ilac.id)]["mevcut"] == 3
        assert eksik[str(ilac.id)]["eksik"] == 7
    
    def test_check_stock_availability_no_stock(
        self, eczane_repository, sample_eczane_data, sample_ilac_data, db_session
    ):
        """Test stock availability check - no stock at all"""
        eczane, user = sample_eczane_data
        ilac = sample_ilac_data
        
        # No stock added
        
        # Check availability
        is_sufficient, eksik = eczane_repository.check_stock_availability(
            str(eczane.id),
            {str(ilac.id): 5}
        )
        
        assert is_sufficient == False
        assert len(eksik) == 1
        assert eksik[str(ilac.id)]["mevcut"] == 0
        assert eksik[str(ilac.id)]["eksik"] == 5
    
    def test_check_stock_availability_multiple_drugs(
        self, eczane_repository, sample_eczane_data, db_session
    ):
        """Test stock availability check with multiple drugs"""
        eczane, user = sample_eczane_data
        timestamp = str(int(time.time() * 1000))[-8:]
        
        # Create 2 drugs
        ilac1 = Ilac(
            barkod=f"TESTMULTI1{timestamp}",
            ad="Test İlaç 1",
            kategori=IlacKategori.NORMAL,
            fiyat=Decimal("30.00"),
            kullanim_talimati="Test",
            receteli=False,
            aktif=True
        )
        ilac2 = Ilac(
            barkod=f"TESTMULTI2{timestamp}",
            ad="Test İlaç 2",
            kategori=IlacKategori.NORMAL,
            fiyat=Decimal("40.00"),
            kullanim_talimati="Test",
            receteli=False,
            aktif=True
        )
        db_session.add_all([ilac1, ilac2])
        db_session.flush()
        
        # Add stock - ilac1 sufficient, ilac2 insufficient
        stok1 = Stok(eczane_id=eczane.id, ilac_id=ilac1.id, miktar=10)
        stok2 = Stok(eczane_id=eczane.id, ilac_id=ilac2.id, miktar=2)
        db_session.add_all([stok1, stok2])
        db_session.commit()
        
        # Check availability
        is_sufficient, eksik = eczane_repository.check_stock_availability(
            str(eczane.id),
            {
                str(ilac1.id): 5,  # Sufficient
                str(ilac2.id): 5   # Insufficient
            }
        )
        
        assert is_sufficient == False
        assert len(eksik) == 1
        assert str(ilac2.id) in eksik
        assert str(ilac1.id) not in eksik


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
