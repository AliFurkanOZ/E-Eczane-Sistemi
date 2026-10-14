"""
Sistem Log Repository — AWS DynamoDB (NoSQL)
Uygulama olaylarının loglanması DynamoDB üzerinden yapılır.
"""
import uuid
import logging
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from boto3.dynamodb.conditions import Key
from app.core.dynamodb import get_sistem_log_table

logger = logging.getLogger(__name__)


def _sanitize_for_dynamodb(obj):
    """DynamoDB için değerleri temizle: None → '', float → Decimal"""
    if isinstance(obj, dict):
        return {k: _sanitize_for_dynamodb(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_sanitize_for_dynamodb(i) for i in obj]
    elif obj is None:
        return ""
    elif isinstance(obj, float):
        return Decimal(str(obj))
    return obj


class SistemLogCosmosRepository:
    """DynamoDB üzerinden sistem log yönetimi"""

    def __init__(self):
        self.table = get_sistem_log_table()

    def log_event(
        self,
        event_type: str,
        user_id: Optional[str],
        message: str,
        details: dict,
        log_level: str = "INFO"
    ) -> Optional[dict]:
        """Sistem log kaydı oluştur"""
        if not self.table:
            logger.warning("DynamoDB not available, skipping system log")
            return None
        try:
            item = {
                "id": str(uuid.uuid4()),
                "event_type": event_type,
                "user_id": user_id or "",
                "message": message,
                "details": _sanitize_for_dynamodb(details),
                "log_level": log_level,
                "timestamp": datetime.utcnow().isoformat()
            }
            self.table.put_item(Item=item)
            return item
        except Exception as e:
            logger.error(f"DynamoDB system log error: {e}")
            return None

    def get_logs(self, event_type: Optional[str] = None, limit: int = 100) -> List[dict]:
        """Sistem loglarını getir"""
        if not self.table:
            return []
        try:
            if event_type:
                response = self.table.query(
                    KeyConditionExpression=Key('event_type').eq(event_type),
                    ScanIndexForward=False,
                    Limit=limit
                )
            else:
                response = self.table.scan(Limit=limit)
            items = response.get('Items', [])
            items.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            return items
        except Exception as e:
            logger.error(f"DynamoDB system log query error: {e}")
            return []
