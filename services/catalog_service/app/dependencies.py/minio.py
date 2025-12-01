from fastapi import Depends
from app.utils.minio_client import minio_client

def get_minio_client():
    return minio_client