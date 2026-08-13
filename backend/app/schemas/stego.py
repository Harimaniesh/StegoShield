from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

# --- Steganography Embed/Extract Schemas ---
class ImageCapacityResponse(BaseModel):
    dimensions: str
    width: int
    height: int
    format: str
    file_size_bytes: int
    sha256_hash: str
    max_payload_bytes: int
    channels: int

class EmbedResponse(BaseModel):
    success: bool
    stego_image_url: str
    stego_filename: str
    original_dimensions: str
    format: str
    original_file_size: int
    stego_file_size: int
    max_capacity_bytes: int
    payload_size_bytes: int
    encryption_status: str
    sha256_hash: str

class ExtractResponse(BaseModel):
    success: bool
    payload_type: str  # text or file
    filename: Optional[str] = None
    file_extension: Optional[str] = None
    recovered_text: Optional[str] = None
    file_download_url: Optional[str] = None
    payload_size_bytes: int
    sha256_hash: str

# --- Steganalysis Forensics Schemas ---
class ChannelStats(BaseModel):
    mean: float
    std_dev: float
    min: int
    max: int
    entropy: float
    variance: float
    lsb_ratio: float

class SteganalysisResponse(BaseModel):
    filename: str
    dimensions: str
    width: int
    height: int
    channels: int
    file_size_bytes: int
    sha256_hash: str
    overall_entropy: float
    channel_stats: Dict[str, ChannelStats]
    lsb_distribution: Dict[str, float]  # Percentage of 1s in LSB per channel
    chi_square_p_value: float
    pixel_variance: float
    noise_level: float
    stego_indicators: List[str]
    risk_score: str  # LOW, MEDIUM, HIGH, CRITICAL
    risk_value: float  # 0 to 100
    disclaimer: str

# --- Image Comparison Schemas ---
class ComparisonResponse(BaseModel):
    dimensions_match: bool
    original_dimensions: str
    stego_dimensions: str
    mean_absolute_error: float
    peak_signal_noise_ratio: float  # PSNR in dB
    changed_pixels_count: int
    changed_pixels_percentage: float
    original_file_size: int
    stego_file_size: int
    file_size_diff_bytes: int
    diff_map_url: str

# --- Metadata Analysis Schemas ---
class MetadataResponse(BaseModel):
    filename: str
    format: str
    mode: str
    dimensions: str
    width: int
    height: int
    file_size_bytes: int
    has_exif: bool
    exif_data: Dict[str, Any]
    camera_make: Optional[str] = None
    camera_model: Optional[str] = None
    software: Optional[str] = None
    date_time: Optional[str] = None
    color_profile: Optional[str] = None

# --- History & Dashboard Schemas ---
class HistoryItem(BaseModel):
    id: str
    action_type: str
    filename: str
    file_size_bytes: int
    image_format: str
    image_dimensions: str
    sha256_hash: str
    risk_score: Optional[str] = None
    risk_value: Optional[float] = None
    payload_size_bytes: Optional[int] = None
    created_at: str

class DashboardStats(BaseModel):
    images_analyzed: int
    messages_embedded: int
    payloads_extracted: int
    suspicious_images: int
    average_risk_score: float
    average_risk_rating: str
    recent_activity: List[HistoryItem]
    risk_distribution: Dict[str, int]
