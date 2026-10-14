"""
Sipariş Durum Geçmişi Repository — AWS DynamoDB (NoSQL)
Sipariş durum değişiklik geçmişi (audit log) DynamoDB üzerinden yönetilir.
"""
import uuid
import logging
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from boto3.dynamodb.conditions import Key
from app.core.dynamodb import get_durum_gecmisi_table
from app.schemas.siparis_gecmisi_cosmos import DurumGecmisiCreate

logger = logging.getLogger(__name__)


def _sanitize_item(item: dict) -> dict:
    """DynamoDB için item'ı temizle: None → '', float → Decimal"""
    sanitized = {}
    for key, value in item.items():
        if value is None:
            sanitized[key] = ""
        elif isinstance(value, float):
            sanitized[key] = Decimal(str(value))
        elif isinstance(value, dict):
            sanitized[key] = _sanitize_item(value)
        else:
            sanitized[key] = value
    return sanitized


class SiparisGecmisiCosmosRepository:
    """DynamoDB üzerinden sipariş durum geçmişi yönetimi"""

    def __init__(self):
        self.table = get_durum_gecmisi_table()

    def create(self, data: DurumGecmisiCreate) -> Optional[dict]:
        """Yeni durum geçmişi kaydı oluştur"""
        if not self.table:
            logger.warning("DynamoDB not available, skipping durum gecmisi create")
            return None
        try:
            item = data.model_dump()
            item["id"] = str(uuid.uuid4())
            item["created_at"] = datetime.utcnow().isoformat()
            # DynamoDB None desteklemez, temizle
            item = _sanitize_item(item)
            self.table.put_item(Item=item)
            return item
        except Exception as e:
            logger.error(f"DynamoDB durum gecmisi create error: {e}")
            return None

    def get_by_siparis_id(self, siparis_id: str) -> List[dict]:
        """Siparişin tüm durum geçmişini getir (partition key ile hızlı)"""
        if not self.table:
            return []
        try:
            response = self.table.query(
                KeyConditionExpression=Key('siparis_id').eq(siparis_id)
            )
            items = response.get('Items', [])
            # Sort by created_at descending (newest first)
            items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            return items
        except Exception as e:
            logger.error(f"DynamoDB durum gecmisi query error: {e}")
            return []

    def get_all(self, limit: int = 50) -> List[dict]:
        """Admin için tüm durum geçmişi kayıtlarını getir (scan)"""
        if not self.table:
            return []
        try:
            response = self.table.scan(Limit=limit)
            items = response.get('Items', [])
            items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            return items
        except Exception as e:
            logger.error(f"DynamoDB durum gecmisi scan error: {e}")
            return []
