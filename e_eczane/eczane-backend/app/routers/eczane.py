from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_eczane
from app.models.user import User
from app.models.eczane import Eczane
from app.models.siparis import Siparis
from app.models.hasta import Hasta
from app.schemas.stok import (
    StokResponse, StokCreate, StokUpdate, 
    StokUyari, IlacEkle
)
from app.schemas.eczane import EczaneResponse, EczaneUpdate
from app.schemas.siparis import (
    SiparisResponse, SiparisDetayItem,
    SiparisDurumGuncelle, SiparisIptal
)
from app.services.eczane_service import EczaneService
from app.services.siparis_service import SiparisService
from app.repositories.stok_repository import StokRepository
from app.repositories.eczane_repository import EczaneRepository
from app.utils.enums import SiparisDurum

router = APIRouter(tags=["Eczane"])

# ==================== PROFİL ====================

@router.get("/profil", response_model=EczaneResponse, summary="Profil Görüntüle")
def get_profil(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Eczane profilini görüntüle
    
    Returns:
        EczaneResponse: Eczane profil bilgileri
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    if not eczane:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eczane profili bulunamadı"
        )
    return eczane

@router.put("/profil", response_model=EczaneResponse, summary="Profil Güncelle")
def update_profil(
    update_data: EczaneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Eczane profilini güncelle
    
    Args:
        update_data: Güncellenecek profil verileri
    
    Returns:
        EczaneResponse: Güncellenmiş profil
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    if not eczane:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eczane profili bulunamadı"
        )
    eczane_service = EczaneService(db)
    return eczane_service.update_profil(eczane.id, update_data)

# ==================== STOK YÖNETİMİ ====================

@router.get("/stoklar", response_model=List[StokResponse], summary="Stokları Listele")
def list_stoklar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Eczaneye ait tüm stokları listele
    
    Returns:
        List[StokResponse]: Stok listesi
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    stok_repo = StokRepository(db)
    stoklar = stok_repo.get_by_eczane(eczane.id)
    # This response construction is kept as is because it's for the final JSON output
    # The error was in the data passed to the repository, not in the response model building.
    return stoklar

@router.get("/stoklar/uyarilar", response_model=List[StokUyari], summary="Stok Uyarıları")
def get_stok_uyarilari(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Düşük stok uyarılarını getir
    
    Returns:
        List[StokUyari]: Düşük stok uyarıları
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    eczane_service = EczaneService(db)
    return eczane_service.get_stok_uyarilari(eczane.id)

@router.post("/stoklar", response_model=StokResponse, status_code=status.HTTP_201_CREATED, summary="Stok Ekle")
def add_stok(
    stok_data: StokCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Yeni stok ekle
    
    Args:
        stok_data: Stok bilgileri
    
    Returns:
        StokResponse: Oluşturulan stok
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    stok_repo = StokRepository(db)
    stok = stok_repo.create(eczane.id, stok_data)
    # The response model will handle the conversion
    return stok

@router.put("/stoklar/{stok_id}", response_model=StokResponse, summary="Stok Güncelle")
def update_stok(
    stok_id: uuid.UUID,
    stok_data: StokUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Stok bilgilerini güncelle
    
    Args:
        stok_id: Stok ID
        stok_data: Güncellenecek veriler
    
    Returns:
        StokResponse: Güncellenmiş stok
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    stok_repo = StokRepository(db)
    stok = stok_repo.get_by_id(stok_id)
    if not stok or stok.eczane_id != eczane.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stok bulunamadı"
        )
    stok = stok_repo.update(stok_id, stok_data)
    return stok

@router.delete("/stoklar/{stok_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Stok Sil")
def delete_stok(
    stok_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Stok kaydını sil
    
    Args:
        stok_id: Stok ID
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    stok_repo = StokRepository(db)
    stok = stok_repo.get_by_id(stok_id)
    if not stok or stok.eczane_id != eczane.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stok bulunamadı"
        )
    stok_repo.delete(stok_id)
    return None

@router.post("/urun-ekle", response_model=StokResponse, status_code=status.HTTP_201_CREATED, summary="Reçetesiz Ürün Ekle")
def add_recetesiz_urun(
    ilac_data: IlacEkle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Reçetesiz ilaç/ürün ekle
    
    İlaç sistemde yoksa oluşturur, varsa sadece stok ekler.
    
    Args:
        ilac_data: İlaç ve stok bilgileri
    
    Returns:
        StokResponse: Oluşturulan stok
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    eczane_service = EczaneService(db)
    _, stok = eczane_service.add_recetesiz_ilac(eczane.id, ilac_data)
    return stok

# ==================== SİPARİŞ YÖNETİMİ ====================

@router.get("/siparisler", response_model=List[SiparisResponse], summary="Siparişleri Listele")
def list_siparisler(
    durum: Optional[str] = Query(None, description="Duruma göre filtrele"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Eczaneye ait siparişleri listele
    
    Args:
        durum: Sipariş durumu filtresi (opsiyonel)
        page: Sayfa numarası
        page_size: Sayfa boyutu
    
    Returns:
        List[SiparisResponse]: Sipariş listesi
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    query = db.query(Siparis).filter(Siparis.eczane_id == eczane.id)
    if durum:
        try:
            durum_enum = SiparisDurum(durum)
            query = query.filter(Siparis.durum == durum_enum)
        except ValueError:
            pass
    
    offset = (page - 1) * page_size
    siparisler = query.order_by(Siparis.created_at.desc()).offset(offset).limit(page_size).all()
    # The response model will handle the conversion of the list of siparis objects
    return siparisler

@router.get("/siparisler/{siparis_id}", response_model=SiparisResponse, summary="Sipariş Detayı")
def get_siparis_detay(
    siparis_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Sipariş detaylarını görüntüle
    
    Args:
        siparis_id: Sipariş ID
    
    Returns:
        SiparisResponse: Sipariş detayları
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    siparis = db.query(Siparis).filter(
        Siparis.id == siparis_id,
        Siparis.eczane_id == eczane.id
    ).first()
    if not siparis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sipariş bulunamadı"
        )
    return siparis

@router.put("/siparisler/{siparis_id}/durum", response_model=SiparisResponse, summary="Sipariş Durumu Güncelle")
def update_siparis_durum(
    siparis_id: uuid.UUID,
    durum_data: SiparisDurumGuncelle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Sipariş durumunu güncelle (Eczane için)
    
    Args:
        siparis_id: Sipariş ID
        durum_data: Yeni durum bilgisi
    
    Returns:
        SiparisResponse: Güncellenmiş sipariş
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    
    # Sipariş kontrolü
    siparis_service = SiparisService(db)
    siparis = siparis_service.get_siparis_by_id_and_eczane(siparis_id, eczane.id)
    if not siparis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sipariş bulunamadı"
        )
    
    siparis = siparis_service.update_durum(
        siparis_id=siparis_id,
        yeni_durum=durum_data.yeni_durum,
        user_id=current_user.id,
        aciklama=durum_data.aciklama
    )
    
    return siparis

@router.post("/siparisler/{siparis_id}/onayla", response_model=SiparisResponse, summary="Sipariş Onayla")
def onayla_siparis(
    siparis_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Siparişi onayla ve hazırlanmaya başla
    
    Args:
        siparis_id: Sipariş ID
    
    Returns:
        SiparisResponse: Onaylanmış sipariş
    """
    durum_data = SiparisDurumGuncelle(
        yeni_durum=SiparisDurum.HAZIRLANIYOR,
        aciklama="Sipariş onaylandı ve hazırlanmaya başlandı"
    )
    # Re-use the update function
    return update_siparis_durum(siparis_id, durum_data, db, current_user)


@router.post("/siparisler/{siparis_id}/iptal", response_model=SiparisResponse, summary="Sipariş İptal Et")
def iptal_siparis(
    siparis_id: uuid.UUID,
    iptal_data: SiparisIptal,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Siparişi iptal et (Eczane için)
    
    Args:
        siparis_id: Sipariş ID
        iptal_data: İptal nedeni
    
    Returns:
        SiparisResponse: İptal edilmiş sipariş
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    
    # Sipariş kontrolü
    siparis_service = SiparisService(db)
    siparis = siparis_service.get_siparis_by_id_and_eczane(siparis_id, eczane.id)
    if not siparis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sipariş bulunamadı"
        )
    
    siparis = siparis_service.iptal_et(
        siparis_id=siparis_id,
        iptal_nedeni=iptal_data.iptal_nedeni,
        user_id=current_user.id
    )
    
    return siparis
