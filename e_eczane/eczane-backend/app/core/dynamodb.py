"""
AWS DynamoDB bağlantı modülü.
Polyglot Persistence mimarisi: PostgreSQL (SQL) + DynamoDB (NoSQL)
"""
import logging
import boto3
from app.core.config import settings

logger = logging.getLogger(__name__)

_dynamodb_resource = None


def get_dynamodb():
    """DynamoDB resource singleton döndür"""
    global _dynamodb_resource
    if _dynamodb_resource is not None:
        return _dynamodb_resource
    try:
        if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
            logger.warning("AWS credentials not configured. DynamoDB disabled.")
            return None
        _dynamodb_resource = boto3.resource(
            'dynamodb',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        return _dynamodb_resource
    except Exception as e:
        logger.error(f"DynamoDB connection failed: {e}")
        return None


def get_table(table_name: str):
    """Belirtilen DynamoDB tablosunu döndür"""
    dynamodb = get_dynamodb()
    if not dynamodb:
        return None
    full_name = f"{settings.DYNAMODB_TABLE_PREFIX}{table_name}"
    return dynamodb.Table(full_name)


def get_bildirim_table():
    """Bildirimler tablosunu döndür"""
    return get_table("bildirimler")


def get_durum_gecmisi_table():
    """Sipariş durum geçmişi tablosunu döndür"""
    return get_table("siparis_durum_gecmisi")


def get_sistem_log_table():
    """Sistem logları tablosunu döndür"""
    return get_table("sistem_loglari")


def init_dynamodb():
    """DynamoDB bağlantısını başlat ve test et"""
    try:
        dynamodb = get_dynamodb()
        if dynamodb:
            table = get_bildirim_table()
            if table:
                # Bağlantı testi - tablo durumunu kontrol et
                status = table.table_status
                logger.info(f"DynamoDB connection successful. Bildirimler table status: {status}")
            else:
                logger.warning("DynamoDB table not found")
        else:
            logger.warning("DynamoDB not configured, running without NoSQL")
    except Exception as e:
        logger.warning(f"DynamoDB init warning: {e}. Application will continue without DynamoDB.")
