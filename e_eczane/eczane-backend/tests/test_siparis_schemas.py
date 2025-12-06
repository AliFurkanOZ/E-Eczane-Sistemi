import pytest
from decimal import Decimal
from datetime import datetime
from app.schemas.siparis import (
    SiparisDetayItem,
    SiparisCreate,
    SiparisResponse,
    SiparisDurumGuncelle,
    SiparisIptal,
    EczaneListItem
)
from app.utils.enums import SiparisDurum, OdemeDurum


class TestSiparisSchemas:
    """Test Sipariş Schemas"""
    
    def test_siparis_detay_item_schema(self):
        """Test SiparisDetayItem schema validation"""
        item = SiparisDetayItem(
            ilac_id="123e4567-e89b-12d3-a456-426614174000",
            ilac_adi="Parol 500mg",
            barkod="8699123456789",
            miktar=2,
            birim_fiyat=Decimal("25.50"),
            ara_toplam=Decimal("51.00")
        )
        
        assert item.ilac_id == "123e4567-e89b-12d3-a456-426614174000"
        assert item.ilac_adi == "Parol 500mg"
        assert item.barkod == "8699123456789"
        assert item.miktar == 2
        assert item.birim_fiyat == Decimal("25.50")
        assert item.ara_toplam == Decimal("51.00")
    
    def test_siparis_detay_item_miktar_validation(self):
        """Test SiparisDetayItem miktar validation"""
        # Valid miktar
        item = SiparisDetayItem(
            ilac_id="123e4567-e89b-12d3-a456-426614174000",
            ilac_adi="Parol 500mg",
            barkod="8699123456789",
            miktar=1,  # Minimum valid
            birim_fiyat=Decimal("25.50"),
            ara_toplam=Decimal("25.50")
        )
        assert item.miktar == 1
        
        # Invalid miktar (zero)
        with pytest.raises(Exception):
            SiparisDetayItem(
                ilac_id="123e4567-e89b-12d3-a456-426614174000",
                ilac_adi="Parol 500mg",
                barkod="8699123456789",
                miktar=0,  # Invalid
                birim_fiyat=Decimal("25.50"),
                ara_toplam=Decimal("0.00")
            )
    
    def test_siparis_create_schema(self):
        """Test SiparisCreate schema validation"""
        items = [
            SiparisDetayItem(
                ilac_id="456e4567-e89b-12d3-a456-426614174000",
                ilac_adi="Parol 500mg",
                barkod="8699123456789",
                miktar=2,
                birim_fiyat=Decimal("25.50"),
                ara_toplam=Decimal("51.00")
            )
        ]
        
        siparis = SiparisCreate(
            eczane_id="123e4567-e89b-12d3-a456-426614174000",
            recete_id=None,
            items=items,
            teslimat_adresi="Atatürk Cad. No:123 Çankaya/ANKARA",
            siparis_notu="Kapı zili çalışmıyor"
        )
        
        assert siparis.eczane_id == "123e4567-e89b-12d3-a456-426614174000"
        assert siparis.recete_id is None
        assert len(siparis.items) == 1
        assert siparis.teslimat_adresi == "Atatürk Cad. No:123 Çankaya/ANKARA"
        assert siparis.siparis_notu == "Kapı zili çalışmıyor"
    
    def test_siparis_create_empty_items(self):
        """Test SiparisCreate with empty items"""
        with pytest.raises(Exception):
            SiparisCreate(
                eczane_id="123e4567-e89b-12d3-a456-426614174000",
                recete_id=None,
                items=[],  # Invalid - empty
                teslimat_adresi="Atatürk Cad. No:123 Çankaya/ANKARA"
            )
    
    def test_siparis_create_address_validation(self):
        """Test SiparisCreate address validation"""
        items = [
            SiparisDetayItem(
                ilac_id="456e4567-e89b-12d3-a456-426614174000",
                ilac_adi="Parol 500mg",
                barkod="8699123456789",
                miktar=2,
                birim_fiyat=Decimal("25.50"),
                ara_toplam=Decimal("51.00")
            )
        ]
        
        # Address too short
        with pytest.raises(Exception):
            SiparisCreate(
                eczane_id="123e4567-e89b-12d3-a456-426614174000",
                items=items,
                teslimat_adresi="Short"  # Less than 10 chars
            )
    
    def test_siparis_response_schema(self):
        """Test SiparisResponse schema validation"""
        items = [
            SiparisDetayItem(
                ilac_id="456e4567-e89b-12d3-a456-426614174000",
                ilac_adi="Parol 500mg",
                barkod="8699123456789",
                miktar=2,
                birim_fiyat=Decimal("25.50"),
                ara_toplam=Decimal("51.00")
            )
        ]
        
        response = SiparisResponse(
            id="789e4567-e89b-12d3-a456-426614174000",
            siparis_no="SIP2025001",
            eczane_id="123e4567-e89b-12d3-a456-426614174000",
            eczane_adi="Çankaya Eczanesi",
            hasta_id="111e4567-e89b-12d3-a456-426614174000",
            hasta_adi="Ahmet Yılmaz",
            recete_id=None,
            toplam_tutar=Decimal("51.00"),
            durum=SiparisDurum.BEKLEMEDE,
            odeme_durumu=OdemeDurum.BEKLEMEDE,
            teslimat_adresi="Atatürk Cad. No:123 Çankaya/ANKARA",
            siparis_notu="Kapı zili çalışmıyor",
            iptal_nedeni=None,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            detaylar=items
        )
        
        assert response.siparis_no == "SIP2025001"
        assert response.durum == SiparisDurum.BEKLEMEDE
        assert response.odeme_durumu == OdemeDurum.BEKLEMEDE
        assert response.toplam_tutar == Decimal("51.00")
        assert len(response.detaylar) == 1
    
    def test_siparis_durum_guncelle_schema(self):
        """Test SiparisDurumGuncelle schema validation"""
        update = SiparisDurumGuncelle(
            yeni_durum=SiparisDurum.HAZIRLANIYOR,
            aciklama="Siparişiniz hazırlanmaya başlandı"
        )
        
        assert update.yeni_durum == SiparisDurum.HAZIRLANIYOR
        assert update.aciklama == "Siparişiniz hazırlanmaya başlandı"
        
        # Without aciklama
        update_no_desc = SiparisDurumGuncelle(
            yeni_durum=SiparisDurum.YOLDA
        )
        assert update_no_desc.aciklama is None
    
    def test_siparis_iptal_schema(self):
        """Test SiparisIptal schema validation"""
        iptal = SiparisIptal(
            iptal_nedeni="Yanlışlıkla sipariş verildi, iptal etmek istiyorum."
        )
        
        assert iptal.iptal_nedeni == "Yanlışlıkla sipariş verildi, iptal etmek istiyorum."
    
    def test_siparis_iptal_nedeni_validation(self):
        """Test SiparisIptal iptal_nedeni validation"""
        # Too short
        with pytest.raises(Exception):
            SiparisIptal(iptal_nedeni="Short")  # Less than 10 chars
        
        # Valid
        iptal = SiparisIptal(
            iptal_nedeni="Bu sipariş artık gerekli değil, iptal ediyorum."
        )
        assert len(iptal.iptal_nedeni) >= 10
    
    def test_eczane_list_item_schema(self):
        """Test EczaneListItem schema validation"""
        stok_durumu = {
            "ilac_id_1": {"miktar": 10, "yeterli": 1},
            "ilac_id_2": {"miktar": 5, "yeterli": 1}
        }
        
        eczane = EczaneListItem(
            id="123e4567-e89b-12d3-a456-426614174000",
            eczane_adi="Çankaya Eczanesi",
            adres="Atatürk Cad. No:45 Çankaya/ANKARA",
            telefon="0312 123 45 67",
            mahalle="Çankaya",
            eczaci_tam_ad="Ecz. Mehmet Yılmaz",
            stok_durumu=stok_durumu,
            tum_urunler_mevcut=True
        )
        
        assert eczane.eczane_adi == "Çankaya Eczanesi"
        assert eczane.mahalle == "Çankaya"
        assert eczane.tum_urunler_mevcut == True
        assert len(eczane.stok_durumu) == 2
        assert eczane.stok_durumu["ilac_id_1"]["miktar"] == 10
    
    def test_siparis_durum_enum_values(self):
        """Test SiparisDurum enum usage in schemas"""
        update1 = SiparisDurumGuncelle(yeni_durum=SiparisDurum.BEKLEMEDE)
        assert update1.yeni_durum == SiparisDurum.BEKLEMEDE
        
        update2 = SiparisDurumGuncelle(yeni_durum=SiparisDurum.ONAYLANDI)
        assert update2.yeni_durum == SiparisDurum.ONAYLANDI
        
        update3 = SiparisDurumGuncelle(yeni_durum=SiparisDurum.HAZIRLANIYOR)
        assert update3.yeni_durum == SiparisDurum.HAZIRLANIYOR
        
        update4 = SiparisDurumGuncelle(yeni_durum=SiparisDurum.YOLDA)
        assert update4.yeni_durum == SiparisDurum.YOLDA
        
        update5 = SiparisDurumGuncelle(yeni_durum=SiparisDurum.TESLIM_EDILDI)
        assert update5.yeni_durum == SiparisDurum.TESLIM_EDILDI
        
        update6 = SiparisDurumGuncelle(yeni_durum=SiparisDurum.IPTAL_EDILDI)
        assert update6.yeni_durum == SiparisDurum.IPTAL_EDILDI
    
    def test_odeme_durum_enum_values(self):
        """Test OdemeDurum enum usage in schemas"""
        response = SiparisResponse(
            id="789e4567-e89b-12d3-a456-426614174000",
            siparis_no="SIP2025001",
            eczane_id="123e4567-e89b-12d3-a456-426614174000",
            eczane_adi="Test Eczane",
            hasta_id="111e4567-e89b-12d3-a456-426614174000",
            hasta_adi="Test Hasta",
            toplam_tutar=Decimal("100.00"),
            durum=SiparisDurum.BEKLEMEDE,
            odeme_durumu=OdemeDurum.ODENDI,
            teslimat_adresi="Test Adres 123",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            detaylar=[]
        )
        
        assert response.odeme_durumu == OdemeDurum.ODENDI
    
    def test_decimal_precision_validation(self):
        """Test decimal precision validation"""
        item = SiparisDetayItem(
            ilac_id="123e4567-e89b-12d3-a456-426614174000",
            ilac_adi="Parol 500mg",
            barkod="8699123456789",
            miktar=2,
            birim_fiyat=Decimal("25.50"),
            ara_toplam=Decimal("51.00")
        )
        
        assert item.birim_fiyat.as_tuple().exponent >= -2
        assert item.ara_toplam.as_tuple().exponent >= -2
    
    def test_negative_values_rejected(self):
        """Test that negative values are rejected"""
        # Negative birim_fiyat
        with pytest.raises(Exception):
            SiparisDetayItem(
                ilac_id="123e4567-e89b-12d3-a456-426614174000",
                ilac_adi="Parol 500mg",
                barkod="8699123456789",
                miktar=2,
                birim_fiyat=Decimal("-25.50"),  # Invalid
                ara_toplam=Decimal("51.00")
            )
        
        # Negative ara_toplam
        with pytest.raises(Exception):
            SiparisDetayItem(
                ilac_id="123e4567-e89b-12d3-a456-426614174000",
                ilac_adi="Parol 500mg",
                barkod="8699123456789",
                miktar=2,
                birim_fiyat=Decimal("25.50"),
                ara_toplam=Decimal("-51.00")  # Invalid
            )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
