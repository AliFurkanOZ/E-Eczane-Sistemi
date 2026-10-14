"""
DynamoDB (NoSQL) Admin Router
Admin kullanıcıları için DynamoDB yönetim endpoint'leri.
"""
import time
import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.core.config import settings
from app.models.user import User
from app.repositories.bildirim_cosmos_repository import BildirimCosmosRepository
from app.repositories.siparis_gecmisi_cosmos_repository import SiparisGecmisiCosmosRepository
from app.repositories.sistem_log_cosmos_repository import SistemLogCosmosRepository

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
def dynamodb_health(current_user: User = Depends(get_current_admin)):
    """DynamoDB bağlantı durumunu kontrol et"""
    from app.core.dynamodb import get_dynamodb
    try:
        dynamodb = get_dynamodb()
        if dynamodb:
            # Tablo erişim testi
            bildirim_repo = BildirimCosmosRepository()
            if bildirim_repo.table:
                return {
                    "status": "connected",
                    "provider": "AWS DynamoDB",
                    "region": settings.AWS_REGION,
                    "table_prefix": settings.DYNAMODB_TABLE_PREFIX
                }
        return {
            "status": "not_configured",
            "provider": "AWS DynamoDB",
            "message": "AWS credentials not configured"
        }
    except Exception as e:
        return {
            "status": "error",
            "provider": "AWS DynamoDB",
            "message": str(e)
        }


@router.get("/stats")
def dynamodb_stats(current_user: User = Depends(get_current_admin)):
    """DynamoDB container istatistiklerini getir"""
    bildirim_repo = BildirimCosmosRepository()
    gecmis_repo = SiparisGecmisiCosmosRepository()
    log_repo = SistemLogCosmosRepository()
    
    return {
        "bildirimler_count": len(bildirim_repo.get_all(limit=1000)),
        "durum_gecmisi_count": len(gecmis_repo.get_all(limit=1000)),
        "sistem_loglari_count": len(log_repo.get_logs(limit=1000)),
        "provider": "AWS DynamoDB",
        "region": settings.AWS_REGION,
        "tables": {
            "bildirimler": f"{settings.DYNAMODB_TABLE_PREFIX}bildirimler",
            "siparis_durum_gecmisi": f"{settings.DYNAMODB_TABLE_PREFIX}siparis_durum_gecmisi",
            "sistem_loglari": f"{settings.DYNAMODB_TABLE_PREFIX}sistem_loglari"
        }
    }


@router.get("/benchmark")
def run_benchmark(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    PostgreSQL vs DynamoDB Hız Karşılaştırma Benchmark'ı.
    4 farklı operasyonda her iki veritabanını test eder:
    1. Tekli Yazma (INSERT / put_item)
    2. Tekli Okuma (SELECT by PK / get_item by PK)
    3. Toplu Tarama (SELECT COUNT / scan)
    4. Tekli Silme (DELETE / delete_item)
    """
    from app.core.dynamodb import get_bildirim_table

    results = []
    test_id = str(uuid.uuid4())
    test_user_id = f"benchmark_{test_id[:8]}"
    dynamo_table = get_bildirim_table()

    if not dynamo_table:
        raise HTTPException(status_code=503, detail="DynamoDB bağlantısı kurulamadı")

    # ────────────────────────────────────────────
    # TEST 1: Tekli Yazma (Single Write)
    # ────────────────────────────────────────────

    # PostgreSQL — INSERT
    pg_write_start = time.perf_counter()
    db.execute(text(
        "INSERT INTO benchmark_test (id, test_key, test_value, created_at) "
        "VALUES (:id, :key, :val, NOW())"
    ), {"id": test_id, "key": test_user_id, "val": "benchmark_test_data"})
    db.flush()
    pg_write_ms = (time.perf_counter() - pg_write_start) * 1000

    # DynamoDB — put_item
    dynamo_item = {
        "user_id": test_user_id,
        "id": test_id,
        "baslik": "Benchmark Test",
        "mesaj": "benchmark_test_data",
        "tip": "benchmark",
        "okundu": False,
        "link": "",
        "created_at": datetime.utcnow().isoformat()
    }
    dyn_write_start = time.perf_counter()
    dynamo_table.put_item(Item=dynamo_item)
    dyn_write_ms = (time.perf_counter() - dyn_write_start) * 1000

    results.append({
        "operation": "Tekli Yazma (Single Write)",
        "description": "Tek bir kayıt oluşturma",
        "pg_operation": "INSERT INTO ... VALUES",
        "dynamo_operation": "put_item",
        "postgresql_ms": round(pg_write_ms, 3),
        "dynamodb_ms": round(dyn_write_ms, 3),
    })

    # ────────────────────────────────────────────
    # TEST 2: Tekli Okuma (Single Read by PK)
    # ────────────────────────────────────────────

    # PostgreSQL — SELECT by PK
    pg_read_start = time.perf_counter()
    db.execute(text(
        "SELECT * FROM benchmark_test WHERE id = :id"
    ), {"id": test_id})
    pg_read_ms = (time.perf_counter() - pg_read_start) * 1000

    # DynamoDB — get_item by partition + sort key
    dyn_read_start = time.perf_counter()
    dynamo_table.get_item(Key={"user_id": test_user_id, "id": test_id})
    dyn_read_ms = (time.perf_counter() - dyn_read_start) * 1000

    results.append({
        "operation": "Tekli Okuma (Single Read)",
        "description": "Primary key ile tek kayıt okuma",
        "pg_operation": "SELECT ... WHERE id =",
        "dynamo_operation": "get_item (PK)",
        "postgresql_ms": round(pg_read_ms, 3),
        "dynamodb_ms": round(dyn_read_ms, 3),
    })

    # ────────────────────────────────────────────
    # TEST 3: Toplu Tarama (Full Scan / Count)
    # ────────────────────────────────────────────

    # PostgreSQL — SELECT COUNT(*)
    pg_scan_start = time.perf_counter()
    db.execute(text("SELECT COUNT(*) FROM benchmark_test"))
    pg_scan_ms = (time.perf_counter() - pg_scan_start) * 1000

    # DynamoDB — scan (full table scan)
    dyn_scan_start = time.perf_counter()
    dynamo_table.scan(Limit=100)
    dyn_scan_ms = (time.perf_counter() - dyn_scan_start) * 1000

    results.append({
        "operation": "Toplu Tarama (Full Scan)",
        "description": "Tablo tarama / sayım işlemi",
        "pg_operation": "SELECT COUNT(*)",
        "dynamo_operation": "scan (Limit=100)",
        "postgresql_ms": round(pg_scan_ms, 3),
        "dynamodb_ms": round(dyn_scan_ms, 3),
    })

    # ────────────────────────────────────────────
    # TEST 4: Tekli Silme (Single Delete)
    # ────────────────────────────────────────────

    # PostgreSQL — DELETE
    pg_del_start = time.perf_counter()
    db.execute(text(
        "DELETE FROM benchmark_test WHERE id = :id"
    ), {"id": test_id})
    db.flush()
    pg_del_ms = (time.perf_counter() - pg_del_start) * 1000

    # DynamoDB — delete_item
    dyn_del_start = time.perf_counter()
    dynamo_table.delete_item(Key={"user_id": test_user_id, "id": test_id})
    dyn_del_ms = (time.perf_counter() - dyn_del_start) * 1000

    results.append({
        "operation": "Tekli Silme (Single Delete)",
        "description": "Tek bir kaydı silme",
        "pg_operation": "DELETE ... WHERE id =",
        "dynamo_operation": "delete_item",
        "postgresql_ms": round(pg_del_ms, 3),
        "dynamodb_ms": round(dyn_del_ms, 3),
    })

    # ────────────────────────────────────────────
    # Rollback — PostgreSQL benchmark verisini temizle
    # ────────────────────────────────────────────
    db.rollback()

    # ────────────────────────────────────────────
    # Sonuçları hesapla
    # ────────────────────────────────────────────
    for r in results:
        pg = r["postgresql_ms"]
        dyn = r["dynamodb_ms"]
        if pg > 0 and dyn > 0:
            if pg < dyn:
                r["winner"] = "PostgreSQL"
                r["difference_pct"] = round(((dyn - pg) / dyn) * 100, 1)
            else:
                r["winner"] = "DynamoDB"
                r["difference_pct"] = round(((pg - dyn) / pg) * 100, 1)
        else:
            r["winner"] = "Belirsiz"
            r["difference_pct"] = 0

    pg_wins = sum(1 for r in results if r["winner"] == "PostgreSQL")
    dyn_wins = sum(1 for r in results if r["winner"] == "DynamoDB")

    pg_total = sum(r["postgresql_ms"] for r in results)
    dyn_total = sum(r["dynamodb_ms"] for r in results)

    return {
        "benchmark_id": test_id,
        "timestamp": datetime.utcnow().isoformat(),
        "postgresql_info": {
            "type": "İlişkisel (SQL)",
            "location": "Lokal (localhost)",
            "engine": "PostgreSQL"
        },
        "dynamodb_info": {
            "type": "NoSQL (Key-Value / Document)",
            "location": f"AWS Bulut ({settings.AWS_REGION})",
            "engine": "AWS DynamoDB"
        },
        "results": results,
        "summary": {
            "postgresql_total_ms": round(pg_total, 3),
            "dynamodb_total_ms": round(dyn_total, 3),
            "postgresql_wins": pg_wins,
            "dynamodb_wins": dyn_wins,
            "overall_winner": "PostgreSQL" if pg_total < dyn_total else "DynamoDB",
            "note": "DynamoDB bulut üzerinde çalıştığı için ağ gecikmesi (network latency) sonuçları etkiler. "
                    "Lokal PostgreSQL doğal olarak ağ gecikmesi avantajına sahiptir. "
                    "DynamoDB'nin gerçek gücü yatay ölçeklenebilirlik ve yüksek eşzamanlı erişimde ortaya çıkar."
        }
    }


@router.get("/bildirimler")
def list_bildirimler(
    user_id: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_admin)
):
    """Bildirimleri listele (admin)"""
    repo = BildirimCosmosRepository()
    if user_id:
        return repo.get_by_user_id(user_id, limit)
    return repo.get_all(limit)


@router.get("/bildirimler/kullanici/{user_id}")
def get_user_bildirimler(
    user_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Belirli kullanıcının bildirimlerini getir"""
    return BildirimCosmosRepository().get_by_user_id(user_id)


@router.get("/siparis-gecmisi/{siparis_id}")
def get_siparis_gecmisi(
    siparis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Sipariş audit trail — durum geçmişini getir"""
    from app.models.siparis import Siparis
    
    target_id = siparis_id
    try:
        uuid.UUID(siparis_id)
    except ValueError:
        # If not a valid UUID, it might be a siparis_no (e.g., ORD-12345)
        siparis = db.query(Siparis).filter(Siparis.siparis_no == siparis_id).first()
        if siparis:
            target_id = str(siparis.id)

    return SiparisGecmisiCosmosRepository().get_by_siparis_id(target_id)


@router.get("/loglar")
def list_loglar(
    event_type: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_admin)
):
    """Sistem loglarını listele"""
    return SistemLogCosmosRepository().get_logs(event_type, limit)
