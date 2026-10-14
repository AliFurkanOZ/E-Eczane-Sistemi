import pytest
from decimal import Decimal
from uuid import uuid4
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.models.user import User
from app.models.admin import Admin
from app.models.eczane import Eczane
from app.models.hasta import Hasta
from app.models.ilac import Ilac
from app.models.stok import Stok
from app.models.siparis import Siparis, SiparisDetay, SiparisDurumGecmisi
from app.models.bildirim import Bildirim
from app.services.siparis_service import SiparisService
from app.schemas.siparis import SiparisCreate, SiparisDetayItem
from app.utils.enums import (
    UserType, OnayDurumu, IlacKategori,
    SiparisDurum, OdemeDurum, BildirimTip
)
from fastapi import HTTPException


# Test database setup
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(bind=engine)


@pytest.fixture
def db_session():
    """Create a test database session"""
    Base.metadata.create_all(bind=engine)
    session = TestSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def setup_test_data(db_session):
    """Setup test data for siparis tests"""
    # Create admin user
    admin_user = User(
        email="admin@test.com",
        password_hash="hashed",
        user_type=UserType.ADMIN,
        is_active=True
    )
    db_session.add(admin_user)
    db_session.flush()
    
    admin = Admin(
        user_id=admin_user.id,
        ad="Admin",
        soyad="User",
        telefon="0312 000 00 00"
    )
    db_session.add(admin)
    
    # Create eczane user
    eczane_user = User(
        email="eczane@test.com",
        password_hash="hashed",
        user_type=UserType.ECZANE,
        is_active=True
    )
    db_session.add(eczane_user)
    db_session.flush()
    
    eczane = Eczane(
        user_id=eczane_user.id,
        sicil_no="TEST123456",
        eczane_adi="Test Eczane",
        eczaci_adi="Mehmet",
        eczaci_soyadi="Yılmaz",
        eczaci_diploma_no="EC123456",
        telefon="0312 123 45 67",
        adres="Test Adres Çankaya/ANKARA",
        mahalle="Kızılay",
        banka_hesap_no="1234567890",
        iban="TR123456789012345678901234",
        onay_durumu=OnayDurumu.ONAYLANDI
    )
    db_session.add(eczane)
    db_session.flush()
    
    # Create hasta user
    hasta_user = User(
        email="hasta@test.com",
        password_hash="hashed",
        user_type=UserType.HASTA,
        is_active=True
    )
    db_session.add(hasta_user)
    db_session.flush()
    
    hasta = Hasta(
        user_id=hasta_user.id,
        tc_no="12345678901",
        ad="Ali",
        soyad="Demir",
        telefon="0532 111 22 33",
        adres="Hasta Adres Kızılay, Çankaya/ANKARA"
    )
    db_session.add(hasta)
    db_session.flush()
    
    # Create test drugs
    ilac1 = Ilac(
        ad="Parol 500mg",
        etken_madde="Paracetamol",
        barkod="8699123456789",
        kategori=IlacKategori.NORMAL,
        kullanim_talimati="Günde 3 kez 1 tablet",
        receteli=False,
        fiyat=Decimal("25.50"),
        aktif=True
    )
    db_session.add(ilac1)
    db_session.flush()
    
    ilac2 = Ilac(
        ad="Augmentin 1000mg",
        etken_madde="Amoxicillin",
        barkod="8699987654321",
        kategori=IlacKategori.KIRMIZI_RECETE,
        kullanim_talimati="Günde 2 kez 1 tablet",
        receteli=True,
        fiyat=Decimal("85.00"),
        aktif=True
    )
    db_session.add(ilac2)
    db_session.flush()
    
    # Create stock
    stok1 = Stok(
        eczane_id=eczane.id,
        ilac_id=ilac1.id,
        miktar=100
    )
    db_session.add(stok1)
    
    stok2 = Stok(
        eczane_id=eczane.id,
        ilac_id=ilac2.id,
        miktar=50
    )
    db_session.add(stok2)
    
    db_session.commit()
    
    return {
        "eczane": eczane,
        "eczane_user": eczane_user,
        "hasta": hasta,
        "hasta_user": hasta_user,
        "ilac1": ilac1,
        "ilac2": ilac2,
        "stok1": stok1,
        "stok2": stok2
    }


class TestSiparisService:
    """Test SiparisService"""
    
    def test_create_siparis_success(self, db_session, setup_test_data):
        """Test successful order creation"""
        service = SiparisService(db_session)
        data = setup_test_data
        
        # Create order items
        items = [
            SiparisDetayItem(
                ilac_id=str(data["ilac1"].id),
                ilac_adi=data["ilac1"].ad,
                barkod=data["ilac1"].barkod,
                miktar=2,
                birim_fiyat=data["ilac1"].fiyat,
                ara_toplam=Decimal("51.00")
            )
        ]
        
        # Create order
        siparis_data = SiparisCreate(
            eczane_id=str(data["eczane"].id),
            recete_id=None,
            items=items,
            teslimat_adresi="Atatürk Cad. No:123 Çankaya/ANKARA",
            siparis_notu="Test sipariş"
        )
        
        siparis = service.create_siparis(
            hasta_id=str(data["hasta"].id),
            siparis_data=siparis_data
        )
        
        # Verify order created
        assert siparis.id is not None
        assert siparis.siparis_no is not None
        assert siparis.hasta_id == str(data["hasta"].id)
        assert siparis.eczane_id == str(data["eczane"].id)
        assert siparis.toplam_tutar == Decimal("51.00")
        assert siparis.durum == SiparisDurum.BEKLEMEDE
        assert siparis.odeme_durumu == OdemeDurum.ODENDI
        
        # Verify stock updated
        stok = db_session.query(Stok).filter(
            Stok.eczane_id == data["eczane"].id,
            Stok.ilac_id == data["ilac1"].id
        ).first()
        assert stok.miktar == 98  # 100 - 2
        
        # Verify order details created
        detaylar = db_session.query(SiparisDetay).filter(
            SiparisDetay.siparis_id == siparis.id
        ).all()
        assert len(detaylar) == 1
        assert detaylar[0].miktar == 2
        
        # Verify status history created
        gecmis = db_session.query(SiparisDurumGecmisi).filter(
            SiparisDurumGecmisi.siparis_id == siparis.id
        ).all()
        assert len(gecmis) == 1
        assert gecmis[0].yeni_durum == SiparisDurum.BEKLEMEDE.value
        
        # Verify notification sent
        bildirim = db_session.query(Bildirim).filter(
            Bildirim.user_id == data["eczane_user"].id,
            Bildirim.tip == BildirimTip.SIPARIS
        ).first()
        assert bildirim is not None
        assert "Yeni Sipariş" in bildirim.baslik
    
    def test_create_siparis_eczane_not_found(self, db_session, setup_test_data):
        """Test order creation with non-existent pharmacy"""
        service = SiparisService(db_session)
        data = setup_test_data
        
        items = [
            SiparisDetayItem(
                ilac_id=str(data["ilac1"].id),
                ilac_adi=data["ilac1"].ad,
                barkod=data["ilac1"].barkod,
                miktar=2,
                birim_fiyat=data["ilac1"].fiyat,
                ara_toplam=Decimal("51.00")
            )
        ]
        
        siparis_data = SiparisCreate(
            eczane_id=str(uuid4()),  # Non-existent eczane
            items=items,
            teslimat_adresi="Test Adres"
        )
        
        with pytest.raises(HTTPException) as exc:
            service.create_siparis(
                hasta_id=str(data["hasta"].id),
                siparis_data=siparis_data
            )
        
        assert exc.value.status_code == 404
        assert "Eczane bulunamadı" in str(exc.value.detail)
    
    def test_create_siparis_insufficient_stock(self, db_session, setup_test_data):
        """Test order creation with insufficient stock"""
        service = SiparisService(db_session)
        data = setup_test_data
        
        items = [
            SiparisDetayItem(
                ilac_id=str(data["ilac1"].id),
                ilac_adi=data["ilac1"].ad,
                barkod=data["ilac1"].barkod,
                miktar=200,  # More than available (100)
                birim_fiyat=data["ilac1"].fiyat,
                ara_toplam=Decimal("5100.00")
            )
        ]
        
        siparis_data = SiparisCreate(
            eczane_id=str(data["eczane"].id),
            items=items,
            teslimat_adresi="Test Adres"
        )
        
        with pytest.raises(HTTPException) as exc:
            service.create_siparis(
                hasta_id=str(data["hasta"].id),
                siparis_data=siparis_data
            )
        
        assert exc.value.status_code == 400
        assert "stok yetersiz" in str(exc.value.detail).lower()
    
    def test_update_durum_success(self, db_session, setup_test_data):
        """Test successful order status update"""
        service = SiparisService(db_session)
        data = setup_test_data
        
        # Create a test order first
        siparis = Siparis(
            hasta_id=data["hasta"].id,
            eczane_id=data["eczane"].id,
            toplam_tutar=Decimal("100.00"),
            durum=SiparisDurum.BEKLEMEDE,
            odeme_durumu=OdemeDurum.ODENDI,
            teslimat_adresi="Test Adres"
        )
        db_session.add(siparis)
        db_session.commit()
        
        # Update status
        updated_siparis = service.update_durum(
            siparis_id=str(siparis.id),
            yeni_durum=SiparisDurum.ONAYLANDI,
            user_id=str(data["eczane_user"].id),
            aciklama="Sipariş onaylandı"
        )
        
        assert updated_siparis.durum == SiparisDurum.ONAYLANDI
        
        # Verify status history
        gecmis = db_session.query(SiparisDurumGecmisi).filter(
            SiparisDurumGecmisi.siparis_id == siparis.id
        ).all()
        assert len(gecmis) >= 1
        
        # Verify notification
        bildirim = db_session.query(Bildirim).filter(
            Bildirim.user_id == data["hasta_user"].id,
            Bildirim.tip == BildirimTip.SIPARIS
        ).first()
        assert bildirim is not None
    
    def test_update_durum_invalid_transition(self, db_session, setup_test_data):
        """Test invalid order status transition"""
        service = SiparisService(db_session)
        data = setup_test_data
        
        # Create order in HAZIRLANIYOR status
        siparis = Siparis(
            hasta_id=data["hasta"].id,
            eczane_id=data["eczane"].id,
            toplam_tutar=Decimal("100.00"),
            durum=SiparisDurum.HAZIRLANIYOR,
            odeme_durumu=OdemeDurum.ODENDI,
            teslimat_adresi="Test Adres"
        )
        db_session.add(siparis)
        db_session.commit()
        
        # Try to cancel - should fail
        with pytest.raises(HTTPException) as exc:
            service.update_durum(
                siparis_id=str(siparis.id),
                yeni_durum=SiparisDurum.IPTAL_EDILDI,
                user_id=str(data["eczane_user"].id)
            )
        
        assert exc.value.status_code == 400
        assert "iptal edilemez" in str(exc.value.detail).lower()
    
    def test_update_durum_delivered_order(self, db_session, setup_test_data):
        """Test updating a delivered order (should fail)"""
        service = SiparisService(db_session)
        data = setup_test_data
        
        # Create delivered order
        siparis = Siparis(
            hasta_id=data["hasta"].id,
            eczane_id=data["eczane"].id,
            toplam_tutar=Decimal("100.00"),
            durum=SiparisDurum.TESLIM_EDILDI,
            odeme_durumu=OdemeDurum.ODENDI,
            teslimat_adresi="Test Adres"
        )
        db_session.add(siparis)
        db_session.commit()
        
        # Try to update - should fail
        with pytest.raises(HTTPException) as exc:
            service.update_durum(
                siparis_id=str(siparis.id),
                yeni_durum=SiparisDurum.YOLDA,
                user_id=str(data["eczane_user"].id)
            )
        
        assert exc.value.status_code == 400
        assert "değiştirilemez" in str(exc.value.detail).lower()
    
    def test_iptal_et_success(self, db_session, setup_test_data):
        """Test successful order cancellation"""
        service = SiparisService(db_session)
        data = setup_test_data
        
        # Create order with details
        siparis = Siparis(
            hasta_id=data["hasta"].id,
            eczane_id=data["eczane"].id,
            toplam_tutar=Decimal("51.00"),
            durum=SiparisDurum.BEKLEMEDE,
            odeme_durumu=OdemeDurum.ODENDI,
            teslimat_adresi="Test Adres"
        )
        db_session.add(siparis)
        db_session.flush()
        
        detay = SiparisDetay(
            siparis_id=siparis.id,
            ilac_id=data["ilac1"].id,
            miktar=5,
            birim_fiyat=Decimal("25.50"),
            ara_toplam=Decimal("127.50")
        )
        db_session.add(detay)
        
        # Reduce stock first
        data["stok1"].miktar -= 5
        db_session.commit()
        
        original_stock = data["stok1"].miktar
        
        # Cancel order
        cancelled_siparis = service.iptal_et(
            siparis_id=str(siparis.id),
            iptal_nedeni="Değişiklik istiyorum",
            user_id=str(data["hasta_user"].id)
        )
        
        assert cancelled_siparis.durum == SiparisDurum.IPTAL_EDILDI
        assert cancelled_siparis.iptal_nedeni == "Değişiklik istiyorum"
        assert cancelled_siparis.odeme_durumu == OdemeDurum.IADE_EDILDI
        
        # Verify stock returned
        db_session.refresh(data["stok1"])
        assert data["stok1"].miktar == original_stock + 5
        
        # Verify notification sent to pharmacy
        bildirim = db_session.query(Bildirim).filter(
            Bildirim.user_id == data["eczane_user"].id
        ).first()
        assert bildirim is not None
    
    def test_iptal_et_hazirlaniyor_durumu(self, db_session, setup_test_data):
        """Test cancelling order in HAZIRLANIYOR status (should fail)"""
        service = SiparisService(db_session)
        data = setup_test_data
        
        siparis = Siparis(
            hasta_id=data["hasta"].id,
            eczane_id=data["eczane"].id,
            toplam_tutar=Decimal("100.00"),
            durum=SiparisDurum.HAZIRLANIYOR,
            odeme_durumu=OdemeDurum.ODENDI,
            teslimat_adresi="Test Adres"
        )
        db_session.add(siparis)
        db_session.commit()
        
        with pytest.raises(HTTPException) as exc:
            service.iptal_et(
                siparis_id=str(siparis.id),
                iptal_nedeni="Artık istemiyorum",
                user_id=str(data["hasta_user"].id)
            )
        
        assert exc.value.status_code == 400
        assert "iptal edilemez" in str(exc.value.detail).lower()
    
    def test_iptal_et_siparis_not_found(self, db_session, setup_test_data):
        """Test cancelling non-existent order"""
        service = SiparisService(db_session)
        data = setup_test_data
        
        with pytest.raises(HTTPException) as exc:
            service.iptal_et(
                siparis_id=str(uuid4()),
                iptal_nedeni="Test nedeni",
                user_id=str(data["hasta_user"].id)
            )
        
        assert exc.value.status_code == 404
        assert "bulunamadı" in str(exc.value.detail).lower()
    
    def test_multiple_items_order(self, db_session, setup_test_data):
        """Test creating order with multiple items"""
        service = SiparisService(db_session)
        data = setup_test_data
        
        items = [
            SiparisDetayItem(
                ilac_id=str(data["ilac1"].id),
                ilac_adi=data["ilac1"].ad,
                barkod=data["ilac1"].barkod,
                miktar=3,
                birim_fiyat=data["ilac1"].fiyat,
                ara_toplam=Decimal("76.50")
            ),
            SiparisDetayItem(
                ilac_id=str(data["ilac2"].id),
                ilac_adi=data["ilac2"].ad,
                barkod=data["ilac2"].barkod,
                miktar=2,
                birim_fiyat=data["ilac2"].fiyat,
                ara_toplam=Decimal("170.00")
            )
        ]
        
        siparis_data = SiparisCreate(
            eczane_id=str(data["eczane"].id),
            items=items,
            teslimat_adresi="Test Adres Multi"
        )
        
        siparis = service.create_siparis(
            hasta_id=str(data["hasta"].id),
            siparis_data=siparis_data
        )
        
        # Verify total
        assert siparis.toplam_tutar == Decimal("246.50")
        
        # Verify details count
        detaylar = db_session.query(SiparisDetay).filter(
            SiparisDetay.siparis_id == siparis.id
        ).all()
        assert len(detaylar) == 2
