"""
Bildirim Repository — AWS DynamoDB (NoSQL)
Bildirim CRUD operasyonları DynamoDB üzerinden yapılır.
"""
import uuid
import logging
from datetime import datetime
from typing import List, Optional
from boto3.dynamodb.conditions import Key, Attr
from app.core.dynamodb import get_bildirim_table
from app.schemas.bildirim_cosmos import BildirimCreate

logger = logging.getLogger(__name__)


class BildirimCosmosRepository:
    """DynamoDB üzerinden bildirim yönetimi"""

    def __init__(self):
        self.table = get_bildirim_table()

    def create(self, data: BildirimCreate) -> Optional[dict]:
        """Yeni bildirim oluştur"""
        if not self.table:
            logger.warning("DynamoDB not available, skipping bildirim create")
            return None
        try:
            item = {
                "id": str(uuid.uuid4()),
                "user_id": data.user_id,
                "baslik": data.baslik,
                "mesaj": data.mesaj,
                "tip": data.tip,
                "okundu": False,
                "link": data.link or "",
                "created_at": datetime.utcnow().isoformat()
            }
            self.table.put_item(Item=item)
            return item
        except Exception as e:
            logger.error(f"DynamoDB bildirim create error: {e}")
            return None

    def get_by_user_id(self, user_id: str, limit: int = 50) -> List[dict]:
        """Kullanıcının bildirimlerini getir (partition key ile hızlı)"""
        if not self.table:
            return []
        try:
            response = self.table.query(
                KeyConditionExpression=Key('user_id').eq(user_id),
                ScanIndexForward=False,
                Limit=limit
            )
            return response.get('Items', [])
        except Exception as e:
            logger.error(f"DynamoDB bildirim query error: {e}")
            return []

    def mark_as_read(self, bildirim_id: str, user_id: str) -> Optional[dict]:
        """Bildirimi okundu olarak işaretle"""
        if not self.table:
            return None
        try:
            response = self.table.update_item(
                Key={'user_id': user_id, 'id': bildirim_id},
                UpdateExpression='SET okundu = :val',
                ExpressionAttributeValues={':val': True},
                ReturnValues='ALL_NEW'
            )
            return response.get('Attributes')
        except Exception as e:
            logger.error(f"DynamoDB bildirim update error: {e}")
            return None

    def get_unread_count(self, user_id: str) -> int:
        """Okunmamış bildirim sayısını getir"""
        if not self.table:
            return 0
        try:
            response = self.table.query(
                KeyConditionExpression=Key('user_id').eq(user_id),
                FilterExpression=Attr('okundu').eq(False),
                Select='COUNT'
            )
            return response.get('Count', 0)
        except Exception as e:
            logger.error(f"DynamoDB bildirim count error: {e}")
            return 0

    def delete(self, bildirim_id: str, user_id: str):
        """Bildirimi sil"""
        if not self.table:
            return
        try:
            self.table.delete_item(Key={'user_id': user_id, 'id': bildirim_id})
        except Exception as e:
            logger.error(f"DynamoDB bildirim delete error: {e}")

    def get_all(self, limit: int = 50) -> List[dict]:
        """Admin için tüm bildirimleri getir (scan)"""
        if not self.table:
            return []
        try:
            response = self.table.scan(Limit=limit)
            items = response.get('Items', [])
            items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            return items
        except Exception as e:
            logger.error(f"DynamoDB bildirim scan error: {e}")
            return []
