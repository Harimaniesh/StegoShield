import os
import uuid
import json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.history import AuditHistory
from app.schemas.stego import EmbedResponse, ExtractResponse, ImageCapacityResponse
from app.security.file_handler import save_and_validate_upload, ensure_upload_dir, cleanup_file
from app.steganography.lsb import embed_lsb, extract_lsb, calculate_image_capacity
from app.security.crypto import compute_file_sha256

router = APIRouter(prefix="/steganography", tags=["steganography"])

@router.post("/capacity", response_model=ImageCapacityResponse)
async def check_capacity(image: UploadFile = File(...)):
    """Calculates available payload capacity for an uploaded cover image."""
    saved_path, sanitized_name, size, file_hash = await save_and_validate_upload(image)
    try:
        cap_info = calculate_image_capacity(str(saved_path))
        return ImageCapacityResponse(
            dimensions=cap_info["dimensions"],
            width=cap_info["width"],
            height=cap_info["height"],
            format=cap_info["format"],
            file_size_bytes=size,
            sha256_hash=file_hash,
            max_payload_bytes=cap_info["max_payload_bytes"],
            channels=cap_info["channels"]
        )
    finally:
        cleanup_file(saved_path)

@router.post("/embed", response_model=EmbedResponse)
async def embed_payload(
    cover_image: UploadFile = File(...),
    password: str = Form(...),
    secret_text: str = Form(None),
    secret_file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """
    Encrypts secret text or secret file with AES-256-GCM and embeds into cover image using LSB steganography.
    """
    if not password or len(password.strip()) == 0:
        raise HTTPException(status_code=400, detail="Password is required for AES-256-GCM encryption.")
        
    if not secret_text and not secret_file:
        raise HTTPException(status_code=400, detail="Either a secret text message or a secret file must be provided.")

    saved_cover_path, sanitized_name, cover_size, cover_hash = await save_and_validate_upload(cover_image)

    # Determine payload bytes and file extension
    is_file = False
    file_ext = ".txt"
    if secret_file:
        is_file = True
        secret_bytes = await secret_file.read()
        file_ext = os.path.splitext(secret_file.filename or ".bin")[1]
    else:
        secret_bytes = secret_text.encode('utf-8')

    upload_dir = ensure_upload_dir()
    stego_filename = f"stego_{uuid.uuid4().hex}.png"
    stego_path = upload_dir / stego_filename

    try:
        cap_info = calculate_image_capacity(str(saved_cover_path))
        
        embed_result = embed_lsb(
            cover_image_path=str(saved_cover_path),
            output_image_path=str(stego_path),
            secret_data=secret_bytes,
            password=password,
            is_file=is_file,
            file_ext=file_ext
        )

        stego_size = stego_path.stat().st_size
        stego_hash = compute_file_sha256(str(stego_path))

        # Record audit log in database
        audit = AuditHistory(
            id=uuid.uuid4().hex,
            action_type="EMBED",
            filename=sanitized_name,
            file_size_bytes=stego_size,
            image_format="PNG",
            image_dimensions=embed_result["dimensions"],
            sha256_hash=stego_hash,
            payload_size_bytes=len(secret_bytes),
            details_json=json.dumps({"stego_filename": stego_filename, "is_file": is_file})
        )
        db.add(audit)
        db.commit()

        return EmbedResponse(
            success=True,
            stego_image_url=f"/api/steganography/download/{stego_filename}",
            stego_filename=stego_filename,
            original_dimensions=embed_result["dimensions"],
            format="PNG",
            original_file_size=cover_size,
            stego_file_size=stego_size,
            max_capacity_bytes=cap_info["max_payload_bytes"],
            payload_size_bytes=len(secret_bytes),
            encryption_status="AES-256-GCM Encrypted (PBKDF2 Derived)",
            sha256_hash=stego_hash
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_file(saved_cover_path)

@router.post("/extract", response_model=ExtractResponse)
async def extract_payload(
    stego_image: UploadFile = File(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Extracts LSB payload from stego image and decrypts using password.
    """
    if not password:
        raise HTTPException(status_code=400, detail="Password is required for decryption.")

    saved_path, sanitized_name, file_size, file_hash = await save_and_validate_upload(stego_image)

    try:
        extract_result = extract_lsb(str(saved_path), password)

        recovered_bytes = extract_result["recovered_bytes"]
        is_file = extract_result["is_file"]
        ext = extract_result["file_extension"]

        recovered_text = None
        download_url = None

        if not is_file:
            try:
                recovered_text = recovered_bytes.decode('utf-8')
            except Exception:
                recovered_text = "[Binary Payload Decrypted Successfully]"
        else:
            upload_dir = ensure_upload_dir()
            extracted_filename = f"extracted_{uuid.uuid4().hex}{ext}"
            extracted_path = upload_dir / extracted_filename
            with open(extracted_path, "wb") as f:
                f.write(recovered_bytes)
            download_url = f"/api/steganography/download/{extracted_filename}"

        # Record audit entry
        audit = AuditHistory(
            id=uuid.uuid4().hex,
            action_type="EXTRACT",
            filename=sanitized_name,
            file_size_bytes=file_size,
            image_format="PNG",
            image_dimensions="Extracted Payload",
            sha256_hash=file_hash,
            payload_size_bytes=len(recovered_bytes),
            details_json=json.dumps({"is_file": is_file, "ext": ext})
        )
        db.add(audit)
        db.commit()

        return ExtractResponse(
            success=True,
            payload_type=extract_result["payload_type"],
            filename=f"payload{ext}" if is_file else None,
            file_extension=ext,
            recovered_text=recovered_text,
            file_download_url=download_url,
            payload_size_bytes=len(recovered_bytes),
            sha256_hash=extract_result["sha256_hash"]
        )

    except ValueError as e:
        # Safe error response without exposing sensitive details
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_file(saved_path)

@router.get("/download/{filename}")
async def download_file(filename: str):
    """Secure file download endpoint for generated stego images and extracted files."""
    upload_dir = ensure_upload_dir()
    clean_filename = os.path.basename(filename)
    target_path = (upload_dir / clean_filename).resolve()

    # Enforce strict sandbox directory boundary check
    if not str(target_path).startswith(str(upload_dir)):
        raise HTTPException(status_code=403, detail="Forbidden directory traversal attempt.")
        
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Requested file not found or expired.")

    return FileResponse(
        path=target_path,
        filename=clean_filename,
        headers={"Content-Disposition": f"attachment; filename={clean_filename}"}
    )
