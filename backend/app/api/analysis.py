import uuid
import json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.history import AuditHistory
from app.schemas.stego import SteganalysisResponse, ComparisonResponse, MetadataResponse
from app.security.file_handler import save_and_validate_upload, ensure_upload_dir, cleanup_file
from app.analysis.steganalysis import steganalyze_image
from app.analysis.comparison import compare_images
from app.analysis.metadata import extract_image_metadata

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.post("/steganalyze", response_model=SteganalysisResponse)
async def steganalyze_endpoint(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Executes forensic steganalysis on an uploaded image.
    Calculates dimensions, entropy, LSB distribution, Chi-Square, noise, and risk score.
    """
    saved_path, sanitized_name, size, file_hash = await save_and_validate_upload(image)

    try:
        result = steganalyze_image(str(saved_path), sanitized_name)

        # Log audit entry
        audit = AuditHistory(
            id=uuid.uuid4().hex,
            action_type="STEGANALYZE",
            filename=sanitized_name,
            file_size_bytes=size,
            image_format=result["dimensions"],
            image_dimensions=result["dimensions"],
            sha256_hash=file_hash,
            risk_score=result["risk_score"],
            risk_value=result["risk_value"],
            details_json=json.dumps({"indicators": result["stego_indicators"]})
        )
        db.add(audit)
        db.commit()

        return SteganalysisResponse(**result)

    finally:
        cleanup_file(saved_path)

@router.post("/compare", response_model=ComparisonResponse)
async def compare_endpoint(
    original_image: UploadFile = File(...),
    stego_image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Compares original image and stego image.
    Calculates pixel difference, MAE, PSNR, changed pixel count/percentage, and difference map.
    """
    orig_path, orig_name, orig_size, orig_hash = await save_and_validate_upload(original_image)
    stego_path, stego_name, stego_size, stego_hash = await save_and_validate_upload(stego_image)

    upload_dir = ensure_upload_dir()
    diff_map_filename = f"diff_{uuid.uuid4().hex}.png"
    diff_map_path = upload_dir / diff_map_filename

    try:
        comp_result = compare_images(
            original_path=str(orig_path),
            stego_path=str(stego_path),
            output_diff_path=str(diff_map_path)
        )

        diff_url = f"/api/steganography/download/{diff_map_filename}"

        # Audit log entry
        audit = AuditHistory(
            id=uuid.uuid4().hex,
            action_type="COMPARE",
            filename=f"{orig_name} vs {stego_name}",
            file_size_bytes=stego_size,
            image_format="PNG",
            image_dimensions=comp_result["original_dimensions"],
            sha256_hash=stego_hash,
            details_json=json.dumps({"psnr": comp_result["peak_signal_noise_ratio"], "mae": comp_result["mean_absolute_error"]})
        )
        db.add(audit)
        db.commit()

        return ComparisonResponse(
            dimensions_match=comp_result["dimensions_match"],
            original_dimensions=comp_result["original_dimensions"],
            stego_dimensions=comp_result["stego_dimensions"],
            mean_absolute_error=comp_result["mean_absolute_error"],
            peak_signal_noise_ratio=comp_result["peak_signal_noise_ratio"],
            changed_pixels_count=comp_result["changed_pixels_count"],
            changed_pixels_percentage=comp_result["changed_pixels_percentage"],
            original_file_size=comp_result["original_file_size"],
            stego_file_size=comp_result["stego_file_size"],
            file_size_diff_bytes=comp_result["file_size_diff_bytes"],
            diff_map_url=diff_url
        )

    finally:
        cleanup_file(orig_path)
        cleanup_file(stego_path)

@router.post("/metadata", response_model=MetadataResponse)
async def metadata_endpoint(
    image: UploadFile = File(...)
):
    """
    Parses EXIF and header metadata from uploaded image.
    """
    saved_path, sanitized_name, size, file_hash = await save_and_validate_upload(image)

    try:
        meta_result = extract_image_metadata(str(saved_path), sanitized_name)
        return MetadataResponse(**meta_result)
    finally:
        cleanup_file(saved_path)
