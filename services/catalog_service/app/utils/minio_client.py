from minio import Minio
from minio.error import S3Error
from app.config import get_settings

settings = get_settings()

minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE
)

bucket_name = settings.MINIO_BUCKET_NAME

try:
    if not minio_client.bucket_exists(bucket_name):
        minio_client.make_bucket(bucket_name)
except S3Error as e:
    print(f"⚠️ MinIO bucket '{bucket_name}' creation failed: {e}")