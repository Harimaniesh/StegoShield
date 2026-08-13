import os
import uuid
import shutil
import logging
from pathlib import Path
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.core.config import settings

logger = logging.getLogger("stegoshield.file_handler")

def ensure_upload_dir() -> Path:
    """Ensures temp upload directory exists."""
    upload_path = Path(settings.UPLOAD_DIR).resolve()
    upload_path.mkdir(parents=True, exist_ok=True)
    return upload_path

def sanitize_filename(filename: str) -> str:
    """Strips directory traversal sequences and unsafe characters."""
    clean_name = os.path.basename(filename)
    # Remove null bytes or weird characters
    clean_name = "".join(c for c in clean_name if c.isalnum() or c in "._- ")
    return clean_name or "uploaded_image.png"

async def save_and_validate_upload(file: UploadFile) -> tuple[Path, str, int, str]:
    """
    Validates uploaded image file size and magic bytes header.
    Saves to temporary directory with UUID filename.
    Returns (saved_path, original_sanitized_name, size_bytes, sha256_hash).
    """
    upload_dir = ensure_upload_dir()
    sanitized_name = sanitize_filename(file.filename or "file.png")
    
    ext = os.path.splitext(sanitized_name)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Only {settings.ALLOWED_EXTENSIONS} are permitted."
        )

    temp_filename = f"{uuid.uuid4().hex}{ext}"
    saved_path = upload_dir / temp_filename

    # Read and validate size & content
    size = 0
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    
    with open(saved_path, "wb") as buffer:
        while chunk := await file.read(65536):
            size += len(chunk)
            if size > max_bytes:
                buffer.close()
                if saved_path.exists():
                    saved_path.unlink()
                raise HTTPException(
                    status_code=413,
                    detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                )
            buffer.write(chunk)

    # Validate image integrity using Pillow (verifies magic bytes header)
    try:
        with Image.open(saved_path) as img:
            img.verify()  # Verify image structure
    except Exception as e:
        if saved_path.exists():
            saved_path.unlink()
        raise HTTPException(
            status_code=400,
            detail="Invalid image file or corrupted header structure."
        ) from e

    from app.security.crypto import compute_file_sha256
    file_hash = compute_file_sha256(str(saved_path))

    return saved_path, sanitized_name, size, file_hash

def cleanup_file(filepath: str | Path):
    """Safely removes temporary file if it exists."""
    try:
        path = Path(filepath)
        if path.exists():
            path.unlink()
    except Exception as e:
        logger.warning(f"Failed to cleanup temp file {filepath}: {e}")
