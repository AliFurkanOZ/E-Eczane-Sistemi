import pytest
from decimal import Decimal
from app.schemas.sepet import SepetItem, SepetAddItem, SepetUpdateItem, SepetResponse


class TestSepetSchemas:
    """Test Sepet Schemas"""
    
    def test_sepet_item_schema(self):
        """Test SepetItem schema validation"""
        item = SepetItem(
            ilac_id="123e4567-e89b-12d3-a456-426614174000",
            ilac_adi="Parol 500mg",
            barkod="8699123456789",
            miktar=2,
            birim_fiyat=Decimal("25.50"),
            ara_toplam=Decimal("51.00"),
            receteli=False
        )
        
        assert item.ilac_id == "123e4567-e89b-12d3-a456-426614174000"
        assert item.ilac_adi == "Parol 500mg"
        assert item.barkod == "8699123456789"
        assert item.miktar == 2
        assert item.birim_fiyat == Decimal("25.50")
        assert item.ara_toplam == Decimal("51.00")
        assert item.receteli == False
    
    def test_sepet_item_miktar_validation(self):
        """Test SepetItem miktar validation"""
        # Valid miktar
        item = SepetItem(
            ilac_id="123e4567-e89b-12d3-a456-426614174000",
            ilac_adi="Parol 500mg",
            barkod="8699123456789",
            miktar=1,  # Minimum valid value
            birim_fiyat=Decimal("25.50"),
            ara_toplam=Decimal("25.50"),
            receteli=False
        )
        assert item.miktar == 1
        
        # Invalid miktar (less than 1)
        with pytest.raises(Exception):
            SepetItem(
                ilac_id="123e4567-e89b-12d3-a456-426614174000",
                ilac_adi="Parol 500mg",
                barkod="8699123456789",
                miktar=0,  # Invalid
                birim_fiyat=Decimal("25.50"),
                ara_toplam=Decimal("0.00"),
                receteli=False
            )
    
    def test_sepet_add_item_schema(self):
        """Test SepetAddItem schema validation"""
        add_item = SepetAddItem(
            ilac_id="123e4567-e89b-12d3-a456-426614174000",
            miktar=3
        )
        
        assert add_item.ilac_id == "123e4567-e89b-12d3-a456-426614174000"
        assert add_item.miktar == 3
    
    def test_sepet_add_item_miktar_validation(self):
        """Test SepetAddItem miktar validation"""
        # Valid miktar range
        add_item = SepetAddItem(
            ilac_id="123e4567-e89b-12d3-a456-426614174000",
            miktar=100  # Maximum valid value
        )
        assert add_item.miktar == 100
        
        # Invalid miktar (less than 1)
        with pytest.raises(Exception):
            SepetAddItem(
                ilac_id="123e4567-e89b-12d3-a456-426614174000",
                miktar=0  # Invalid
            )
        
        # Invalid miktar (greater than 100)
        with pytest.raises(Exception):
            SepetAddItem(
                ilac_id="123e4567-e89b-12d3-a456-426614174000",
                miktar=101  # Invalid
            )
    
    def test_sepet_update_item_schema(self):
        """Test SepetUpdateItem schema validation"""
        update_item = SepetUpdateItem(miktar=5)
        assert update_item.miktar == 5
        
        # Test miktar 0 (valid for deletion)
        update_item_zero = SepetUpdateItem(miktar=0)
        assert update_item_zero.miktar == 0
    
    def test_sepet_update_item_miktar_validation(self):
        """Test SepetUpdateItem miktar validation"""
        # Valid miktar range
        update_item = SepetUpdateItem(miktar=100)  # Maximum valid value
        assert update_item.miktar == 100
        
        # Invalid miktar (greater than 100)
        with pytest.raises(Exception):
            SepetUpdateItem(miktar=101)  # Invalid
    
    def test_sepet_response_schema(self):
        """Test SepetResponse schema validation"""
        # Create sample items
        items = [
            SepetItem(
                ilac_id="123e4567-e89b-12d3-a456-426614174000",
                ilac_adi="Parol 500mg",
                barkod="8699123456789",
                miktar=2,
                birim_fiyat=Decimal("25.50"),
                ara_toplam=Decimal("51.00"),
                receteli=False
            ),
            SepetItem(
                ilac_id="987e6543-e89b-12d3-a456-426614174999",
                ilac_adi="Augmentin 1000mg",
                barkod="8699987654321",
                miktar=1,
                birim_fiyat=Decimal("85.00"),
                ara_toplam=Decimal("85.00"),
                receteli=True
            )
        ]
        
        response = SepetResponse(
            items=items,
            toplam_urun=2,
            toplam_tutar=Decimal("136.00"),
            recete_id="abcd1234-efgh-5678-ijkl-9012mnop3456"
        )
        
        assert len(response.items) == 2
        assert response.toplam_urun == 2
        assert response.toplam_tutar == Decimal("136.00")
        assert response.recete_id == "abcd1234-efgh-5678-ijkl-9012mnop3456"
        
        # Test without recete_id
        response_no_recete = SepetResponse(
            items=items,
            toplam_urun=2,
            toplam_tutar=Decimal("136.00")
        )
        assert response_no_recete.recete_id is None
    
    def test_decimal_precision_validation(self):
        """Test decimal precision validation"""
        item = SepetItem(
            ilac_id="123e4567-e89b-12d3-a456-426614174000",
            ilac_adi="Parol 500mg",
            barkod="8699123456789",
            miktar=2,
            birim_fiyat=Decimal("25.50"),  # 2 decimal places
            ara_toplam=Decimal("51.00"),   # 2 decimal places
            receteli=False
        )
        
        assert item.birim_fiyat.as_tuple().exponent >= -2
        assert item.ara_toplam.as_tuple().exponent >= -2
    
    def test_negative_values_rejected(self):
        """Test that negative values are rejected"""
        # Negative birim_fiyat
        with pytest.raises(Exception):
            SepetItem(
                ilac_id="123e4567-e89b-12d3-a456-426614174000",
                ilac_adi="Parol 500mg",
                barkod="8699123456789",
                miktar=2,
                birim_fiyat=Decimal("-25.50"),  # Invalid
                ara_toplam=Decimal("51.00"),
                receteli=False
            )
        
        # Negative ara_toplam
        with pytest.raises(Exception):
            SepetItem(
                ilac_id="123e4567-e89b-12d3-a456-426614174000",
                ilac_adi="Parol 500mg",
                barkod="8699123456789",
                miktar=2,
                birim_fiyat=Decimal("25.50"),
                ara_toplam=Decimal("-51.00"),  # Invalid
                receteli=False
            )
        
        # Negative toplam_tutar
        with pytest.raises(Exception):
            SepetResponse(
                items=[],
                toplam_urun=0,
                toplam_tutar=Decimal("-100.00")  # Invalid
            )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
