import os
import pytest
import numpy as np
from PIL import Image
from app.steganography.lsb import embed_lsb, extract_lsb, calculate_image_capacity

@pytest.fixture
def sample_cover_image(tmp_path):
    """Creates a temporary 100x100 RGB PNG test image."""
    img_path = tmp_path / "cover.png"
    img_array = np.random.randint(50, 200, size=(100, 100, 3), dtype=np.uint8)
    img = Image.fromarray(img_array, mode="RGB")
    img.save(img_path, format="PNG")
    return str(img_path)

def test_image_capacity_calculation(sample_cover_image):
    info = calculate_image_capacity(sample_cover_image)
    assert info["width"] == 100
    assert info["height"] == 100
    assert info["dimensions"] == "100x100"
    # Total bytes = 100 * 100 * 3 // 8 = 3750 bytes
    assert info["total_capacity_bytes"] == 3750
    assert info["max_payload_bytes"] > 3600

def test_embed_and_extract_text(sample_cover_image, tmp_path):
    stego_path = str(tmp_path / "stego.png")
    secret_text = b"Confidential Cyber Investigation Report"
    password = "ForensicPassword2026!"

    embed_result = embed_lsb(
        cover_image_path=sample_cover_image,
        output_image_path=stego_path,
        secret_data=secret_text,
        password=password,
        is_file=False
    )

    assert os.path.exists(stego_path)
    assert embed_result["payload_size_bytes"] == len(secret_text)

    # Extract
    extract_result = extract_lsb(stego_path, password)
    assert extract_result["recovered_bytes"] == secret_text
    assert extract_result["is_file"] is False
    assert extract_result["sha256_hash"] == embed_result["sha256_hash"]

def test_extract_wrong_password(sample_cover_image, tmp_path):
    stego_path = str(tmp_path / "stego.png")
    secret_text = b"Secret data"
    password = "CorrectPassword"

    embed_lsb(sample_cover_image, stego_path, secret_text, password)

    with pytest.raises(ValueError, match="Decryption failed"):
        extract_lsb(stego_path, "WrongPassword")

def test_extract_non_stego_image(sample_cover_image):
    with pytest.raises(ValueError, match="No valid StegoShield hidden payload"):
        extract_lsb(sample_cover_image, "Password")
