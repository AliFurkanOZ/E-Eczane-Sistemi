from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import date
from app.core.database import get_db
from app.core.dependencies import get_current_doktor
from app.models.user import User
from app.models.doktor import Doktor
from app.models.recete import Recete, ReceteIlac
from app.models.ilac import Ilac
from app.models.hasta import Hasta
from app.schemas.doktor import DoktorProfileResponse, ReceteCreate, ReceteIlacCreate
from app.schemas.recete import ReceteResponse
from app.schemas.ilac import IlacSearchResponse, IlacResponse
from app.repositories.ilac_repository import IlacRepository
from app.services.recete_service import ReceteService

router = APIRouter()


@router.get("/profil", response_model=DoktorProfileResponse, summary="Doktor Profilini Görüntüle")
def get_profil(current_user: User = Depends(get_current_doktor), db: Session = Depends(get_db)):
    """
    Giriş yapmış doktorun profil bilgilerini döndürür.
    """
    doktor = db.query(Doktor).filter(Doktor.user_id == current_user.id).first()
    if not doktor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doktor profili bulunamadı."
        )
    
    return DoktorProfileResponse(
        id=str(doktor.id),
        diploma_no=doktor.diploma_no,
        ad=doktor.ad,
        soyad=doktor.soyad,
        uzmanlik=doktor.uzmanlik,
        hastane=doktor.hastane,
        telefon=doktor.telefon,
        email=current_user.email
    )


@router.get("/ilac/ara", response_model=IlacSearchResponse, summary="İlaç Ara")
async def ara_ilac(
    query: Optional[str] = Query(None, description="İlaç adı veya barkod"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_doktor)
):
    """
    Reçeteye eklemek için ilaç ara
    """
    from app.schemas.ilac import IlacSearchParams
    
    search_params = IlacSearchParams(
        query=query,
        page=page,
        page_size=page_size
    )
    
    ilac_repo = IlacRepository(db)
    ilaclar, total = ilac_repo.search(search_params)
    
    return {
        "items": ilaclar,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.post("/recete/yaz", status_code=status.HTTP_201_CREATED, summary="Reçete Yaz")
async def yaz_recete(
    recete_data: ReceteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_doktor)
):
    """
    Yeni reçete oluştur
    
    - **tc_no**: Hasta TC Kimlik No
    - **ilaclar**: İlaç listesi [{"ilac_id": "...", "miktar": 1, "kullanim_talimati": "..."}]
    """
    doktor = db.query(Doktor).filter(Doktor.user_id == current_user.id).first()
    if not doktor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doktor profili bulunamadı."
        )
    
    # TC No doğrula (isteğe bağlı - hasta kayıtlı değilse de reçete yazılabilir)
    hasta = db.query(Hasta).filter(Hasta.tc_no == recete_data.tc_no).first()
    
    # Benzersiz reçete numarası oluştur
    import random
    import string
    recete_no = f"RCT{date.today().strftime('%Y%m%d')}{random.randint(1000, 9999)}"
    
    # Reçete oluştur
    recete = Recete(
        recete_no=recete_no,
        tc_no=recete_data.tc_no,
        tarih=date.today(),
        doktor_adi=doktor.tam_ad,
        hastane=doktor.hastane or "Belirtilmemiş"
    )
    db.add(recete)
    db.flush()
    
    # İlaçları ekle
    toplam_tutar = 0
    ilac_detaylari = []
    
    for ilac_item in recete_data.ilaclar:
        ilac = db.query(Ilac).filter(Ilac.id == uuid.UUID(ilac_item.get("ilac_id"))).first()
        if not ilac:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"İlaç bulunamadı: {ilac_item.get('ilac_id')}"
            )
        
        recete_ilac = ReceteIlac(
            recete_id=recete.id,
            ilac_id=ilac.id,
            miktar=ilac_item.get("miktar", 1),
            kullanim_suresi=ilac_item.get("kullanim_talimati", "")
        )
        db.add(recete_ilac)
        
        toplam_tutar += float(ilac.fiyat) * ilac_item.get("miktar", 1)
        ilac_detaylari.append({
            "ilac_adi": ilac.ad,
            "miktar": ilac_item.get("miktar", 1),
            "kullanim_talimati": ilac_item.get("kullanim_talimati", ""),
            "fiyat": float(ilac.fiyat)
        })
    
    db.commit()
    db.refresh(recete)
    
    return {
        "success": True,
        "message": "Reçete başarıyla oluşturuldu",
        "recete_no": recete_no,
        "tc_no": recete_data.tc_no,
        "hasta_adi": f"{hasta.ad} {hasta.soyad}" if hasta else "Kayıtsız Hasta",
        "doktor_adi": doktor.tam_ad,
        "hastane": doktor.hastane,
        "tarih": date.today().isoformat(),
        "ilaclar": ilac_detaylari,
        "toplam_tutar": toplam_tutar
    }


@router.get("/recetelerim", summary="Yazdığım Reçeteler")
async def listele_recetelerim(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_doktor)
):
    """
    Doktorun yazdığı reçeteleri listeler
    """
    doktor = db.query(Doktor).filter(Doktor.user_id == current_user.id).first()
    if not doktor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doktor profili bulunamadı."
        )
    
    # Doktorun yazdığı reçeteler (doktor_adi ile eşleştir)
    query = db.query(Recete).filter(Recete.doktor_adi == doktor.tam_ad)
    
    total = query.count()
    offset = (page - 1) * page_size
    receteler = query.order_by(Recete.created_at.desc()).offset(offset).limit(page_size).all()
    
    result = []
    for recete in receteler:
        ilac_listesi = []
        for ri in recete.ilaclar:
            ilac = db.query(Ilac).filter(Ilac.id == ri.ilac_id).first()
            if ilac:
                ilac_listesi.append({
                    "ilac_adi": ilac.ad,
                    "miktar": ri.miktar,
                    "kullanim_talimati": ri.kullanim_suresi,
                    "fiyat": float(ilac.fiyat)
                })
        
        # Hasta adını bul
        hasta = db.query(Hasta).filter(Hasta.tc_no == recete.tc_no).first()
        
        result.append({
            "id": str(recete.id),
            "recete_no": recete.recete_no,
            "tc_no": recete.tc_no,
            "hasta_adi": f"{hasta.ad} {hasta.soyad}" if hasta else "Kayıtsız Hasta",
            "tarih": recete.tarih.isoformat() if recete.tarih else None,
            "durum": recete.durum.value if recete.durum else "aktif",
            "ilaclar": ilac_listesi,
            "toplam_tutar": sum(i.get("fiyat", 0) * i.get("miktar", 1) for i in ilac_listesi)
        })
    
    return {
        "items": result,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }
