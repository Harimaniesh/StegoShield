from PIL import Image, ExifTags
from pathlib import Path
from typing import Dict, Any

def extract_image_metadata(image_path: str, filename: str) -> Dict[str, Any]:
    """
    Extracts EXIF data, camera hardware info, software, timestamps, and image stats.
    Handles images without EXIF metadata gracefully.
    """
    file_path = Path(image_path)
    file_size = file_path.stat().st_size

    exif_parsed: Dict[str, Any] = {}
    has_exif = False
    camera_make = None
    camera_model = None
    software = None
    date_time = None
    color_profile = None

    with Image.open(image_path) as img:
        fmt = img.format or "PNG"
        mode = img.mode
        width, height = img.size
        
        info = img.info
        if "icc_profile" in info:
            color_profile = "ICC Profile Present"
        else:
            color_profile = "sRGB Standard / Unspecified"

        try:
            raw_exif = img._getexif()
            if raw_exif:
                has_exif = True
                for tag_id, value in raw_exif.items():
                    tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                    
                    # Convert byte values to strings for JSON serialization
                    if isinstance(value, bytes):
                        try:
                            value = value.decode("utf-8", errors="ignore").strip("\x00")
                        except Exception:
                            value = str(value)
                    else:
                        value = str(value)

                    exif_parsed[tag_name] = value

                    if tag_name == "Make":
                        camera_make = value
                    elif tag_name == "Model":
                        camera_model = value
                    elif tag_name == "Software":
                        software = value
                    elif tag_name in ("DateTime", "DateTimeOriginal"):
                        date_time = value
        except Exception:
            has_exif = False

    return {
        "filename": filename,
        "format": fmt,
        "mode": mode,
        "dimensions": f"{width}x{height}",
        "width": width,
        "height": height,
        "file_size_bytes": file_size,
        "has_exif": has_exif,
        "exif_data": exif_parsed,
        "camera_make": camera_make,
        "camera_model": camera_model,
        "software": software,
        "date_time": date_time,
        "color_profile": color_profile
    }
