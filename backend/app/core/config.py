import os
import secrets
import logging
from pydantic_settings import BaseSettings

logger = logging.getLogger("stegoshield.config")

def get_jwt_secret() -> str:
    secret = os.getenv("STEGOSHIELD_SECRET_KEY")
    if secret:
        return secret
    secret_file = "secret_key.txt"
    if os.path.exists(secret_file):
        with open(secret_file, "r", encoding="utf-8") as f:
            return f.read().strip()
    logger.warning("TODO(security): Generating ephemeral secret key for instance-isolated session.")
    gen_secret = secrets.token_hex(32)
    return gen_secret

class Settings(BaseSettings):
    PROJECT_NAME: str = "StegoShield"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    HOST: str = "127.0.0.1"  # Bound to localhost for security
    PORT: int = 8000
    SECRET_KEY: str = get_jwt_secret()
    DATABASE_URL: str = "sqlite:///./stegoshield.db"
    UPLOAD_DIR: str = "./temp_uploads"
    MAX_UPLOAD_SIZE_MB: int = 15  # 15MB limit
    ALLOWED_EXTENSIONS: list[str] = [".png", ".jpg", ".jpeg", ".bmp"]

    class Config:
        case_sensitive = True

settings = Settings()
