import pytest
from sqlalchemy.orm import Session
from datetime import date, timedelta
from decimal import Decimal
from app.core.database import SessionLocal
from app.services.recete_service import ReceteService
from app.schemas.recete import ReceteQuery, ReceteResponse, ReceteIlacItem
from app.models.recete import Recete, ReceteIlac, ReceteDurum
from app.models.ilac import Ilac
from app.utils.enums import IlacKategori


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
            db.query(ReceteIlac).filter(
                ReceteIlac.recete_id.in_(
                    db.query(Recete.id).filter(Recete.recete_no.like('%RCT2025%'))
                )
            ).delete(synchronize_session=False)
            db.query(Recete).filter(Recete.recete_no.like('%RCT2025%')).delete(synchronize_session=False)
            db.query(Ilac).filter(Ilac.barkod.like('8699%')).delete(synchronize_session=False)
            db.commit()
        except Exception as e:
            print(f"Cleanup error: {e}")
            db.rollback()
        finally:
            db.close()


@pytest.fixture
def recete_service(db_session):
    """ReceteService fixture"""
    return ReceteService(db_session)


class TestReceteSchemas:
    """Test Reçete Schemas"""
    
    def test_recete_query_schema(self):
        """Test ReceteQuery schema validation"""
        query = ReceteQuery(
            tc_no="12345678901",
            recete_no="RCT2025001"
        )
        assert query.tc_no == "12345678901"
        assert query.recete_no == "RCT2025001"
    
    def test_recete_query_tc_validation(self):
        """Test TC No validation"""
        from pydantic import ValidationError
        
        # Invalid TC No - not digits
        with pytest.raises(ValueError, match="sadece rakamlardan"):
            ReceteQuery(tc_no="1234567890A", recete_no="RCT2025001")
        
        # Invalid TC No - wrong length (Pydantic validates before custom validator)
        with pytest.raises(ValidationError):
            ReceteQuery(tc_no="123456789", recete_no="RCT2025001")
    
    def test_recete_ilac_item_schema(self):
        """Test ReceteIlacItem schema"""
        item = ReceteIlacItem(
            ilac_id="test-uuid",
            barkod="8699123456789",
            ad="Parol 500mg",
            kategori=IlacKategori.NORMAL,
            miktar=2,
            kullanim_talimati="Günde 3 kez",
            fiyat=Decimal("25.50"),
            etken_madde="Parasetamol"
        )
        assert item.miktar == 2
        assert item.fiyat == Decimal("25.50")
        assert item.kategori == IlacKategori.NORMAL
    
    def test_recete_response_schema(self):
        """Test ReceteResponse schema"""
        response = ReceteResponse(
            recete_no="RCT2025001",
            tc_no="12345678901",
            tarih=date.today(),
            doktor_adi="Dr. Test",
            hastane="Test Hastanesi",
            ilac_listesi=[],
            toplam_tutar=Decimal("0.00")
        )
        assert response.recete_no == "RCT2025001"
        assert response.toplam_tutar == Decimal("0.00")


class TestReceteService:
    """Test Reçete Service"""
    
    def test_sorgula_fake_recete_valid(self, recete_service):
        """Test fake prescription query with valid data"""
        query = ReceteQuery(
            tc_no="12345678901",
            recete_no="RCT2025001"
        )
        
        result = recete_service.sorgula_recete(query)
        
        assert result is not None
        assert result.recete_no == "RCT2025001"
        assert result.tc_no == "12345678901"
        assert len(result.ilac_listesi) >= 2  # RCT2025001 has 2 drugs
        assert result.toplam_tutar > 0
        assert result.doktor_adi is not None
        assert result.hastane is not None
    
    def test_sorgula_fake_recete_invalid_tc(self, recete_service):
        """Test fake prescription with invalid TC No"""
        query = ReceteQuery(
            tc_no="99999999999",  # TC No not in the fake data
            recete_no="RCT2025001"
        )
        
        result = recete_service.sorgula_recete(query)
        
        assert result is None
    
    def test_sorgula_fake_recete_invalid_recete_no(self, recete_service):
        """Test fake prescription with invalid prescription number"""
        query = ReceteQuery(
            tc_no="12345678901",
            recete_no="RCT9999999"  # Non-existent prescription
        )
        
        result = recete_service.sorgula_recete(query)
        
        assert result is None
    
    def test_sorgula_recete_multiple_tc(self, recete_service, db_session):
        """Test prescription with multiple valid TC numbers"""
        # Clean any existing RCT2025001 first
        db_session.query(ReceteIlac).filter(
            ReceteIlac.recete_id.in_(
                db_session.query(Recete.id).filter(Recete.recete_no == "RCT2025001")
            )
        ).delete(synchronize_session=False)
        db_session.query(Recete).filter(Recete.recete_no == "RCT2025001").delete()
        db_session.commit()
        
        # RCT2025001 is valid for both 12345678901 and 11111111111
        query1 = ReceteQuery(tc_no="12345678901", recete_no="RCT2025001")
        query2 = ReceteQuery(tc_no="11111111111", recete_no="RCT2025001")
        
        result1 = recete_service.sorgula_recete(query1)
        # After first query, the prescription is saved with TC: 12345678901
        # Second query with different TC should still work because fake data allows both
        result2 = recete_service.sorgula_recete(query2)
        
        assert result1 is not None
        assert result2 is not None
        assert result1.recete_no == result2.recete_no
        # Both should have same drugs
        assert len(result1.ilac_listesi) >= 2
    
    def test_recete_saved_to_database(self, recete_service, db_session):
        """Test that fake prescription is saved to database"""
        query = ReceteQuery(
            tc_no="12345678901",
            recete_no="RCT2025001"
        )
        
        # First query - should generate and save
        result1 = recete_service.sorgula_recete(query)
        assert result1 is not None
        
        # Check database
        recete = db_session.query(Recete).filter(
            Recete.recete_no == "RCT2025001"
        ).first()
        
        assert recete is not None
        assert recete.tc_no == "12345678901"
        assert recete.durum == ReceteDurum.AKTIF
        assert len(recete.ilaclar) >= 2
    
    def test_recete_from_database(self, recete_service, db_session):
        """Test querying prescription from database"""
        # Create a prescription directly in database
        ilac = Ilac(
            barkod="8699TEST123",
            ad="Test İlaç",
            kategori=IlacKategori.NORMAL,
            fiyat=Decimal("50.00"),
            kullanim_talimati="Test talimat",
            receteli=False,
            aktif=True
        )
        db_session.add(ilac)
        db_session.flush()
        
        recete = Recete(
            recete_no="RCT2025TEST",
            tc_no="12345678901",
            tarih=date.today(),
            durum=ReceteDurum.AKTIF,
            doktor_adi="Dr. Database Test",
            hastane="Test Hospital"
        )
        db_session.add(recete)
        db_session.flush()
        
        recete_ilac = ReceteIlac(
            recete_id=recete.id,
            ilac_id=ilac.id,
            miktar=3
        )
        db_session.add(recete_ilac)
        db_session.commit()
        
        # Now query it
        query = ReceteQuery(tc_no="12345678901", recete_no="RCT2025TEST")
        result = recete_service.sorgula_recete(query)
        
        assert result is not None
        assert result.recete_no == "RCT2025TEST"
        assert result.doktor_adi == "Dr. Database Test"
        assert len(result.ilac_listesi) == 1
        assert result.ilac_listesi[0].miktar == 3
        assert result.toplam_tutar == Decimal("150.00")  # 50 * 3
    
    def test_fake_ilac_creation(self, recete_service, db_session):
        """Test that fake drugs are created correctly"""
        query = ReceteQuery(tc_no="12345678901", recete_no="RCT2025001")
        result = recete_service.sorgula_recete(query)
        
        assert result is not None
        
        # Check that drugs exist in database
        for ilac_item in result.ilac_listesi:
            ilac = db_session.query(Ilac).filter(
                Ilac.barkod == ilac_item.barkod
            ).first()
            
            assert ilac is not None
            assert ilac.ad == ilac_item.ad
            assert ilac.fiyat == ilac_item.fiyat
            assert ilac.kategori == ilac_item.kategori
    
    def test_recete_calculation(self, recete_service):
        """Test total amount calculation"""
        query = ReceteQuery(tc_no="98765432109", recete_no="RCT2025003")
        result = recete_service.sorgula_recete(query)
        
        assert result is not None
        
        # Calculate manually
        manual_total = Decimal("0.00")
        for item in result.ilac_listesi:
            manual_total += item.fiyat * item.miktar
        
        assert result.toplam_tutar == manual_total
    
    def test_recete_with_kirmizi_recete(self, recete_service):
        """Test prescription with red prescription drugs"""
        query = ReceteQuery(tc_no="12345678901", recete_no="RCT2025001")
        result = recete_service.sorgula_recete(query)
        
        assert result is not None
        
        # Check if any drug is KIRMIZI_RECETE (Augmentin in fake data)
        has_kirmizi_recete = any(
            item.kategori == IlacKategori.KIRMIZI_RECETE
            for item in result.ilac_listesi
        )
        
        assert has_kirmizi_recete
    
    def test_recete_date_range(self, recete_service):
        """Test that prescription date is within acceptable range"""
        query = ReceteQuery(tc_no="12345678901", recete_no="RCT2025001")
        result = recete_service.sorgula_recete(query)
        
        assert result is not None
        
        # Date should be within last 7 days
        today = date.today()
        seven_days_ago = today - timedelta(days=7)
        
        assert seven_days_ago <= result.tarih <= today
    
    def test_get_or_create_fake_ilac_idempotent(self, recete_service, db_session):
        """Test that getting fake drug multiple times doesn't create duplicates"""
        barkod = "8699123456789"
        
        # First call - should create
        ilac1 = recete_service._get_or_create_fake_ilac(barkod)
        assert ilac1 is not None
        
        # Second call - should return existing
        ilac2 = recete_service._get_or_create_fake_ilac(barkod)
        assert ilac2 is not None
        
        # Should be the same drug
        assert ilac1.id == ilac2.id
        
        # Check database count
        count = db_session.query(Ilac).filter(Ilac.barkod == barkod).count()
        assert count == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
