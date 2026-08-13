import pytest
import numpy as np
from PIL import Image
from app.analysis.steganalysis import steganalyze_image, calculate_shannon_entropy

@pytest.fixture
def clean_and_stego_images(tmp_path):
    clean_path = str(tmp_path / "clean.png")
    # Natural image with smooth gradients
    x, y = np.meshgrid(np.linspace(0, 1, 100), np.linspace(0, 1, 100))
    gradient = np.uint8((x + y) * 100 + 20)
    rgb_clean = np.stack([gradient, gradient, gradient], axis=2)
    Image.fromarray(rgb_clean).save(clean_path)

    return clean_path

def test_shannon_entropy():
    # Uniform array of zeros -> entropy = 0.0
    zeros = np.zeros((100, 100), dtype=np.uint8)
    assert calculate_shannon_entropy(zeros) == 0.0

    # Perfectly uniform distribution 0..255 -> max entropy = 8.0
    uniform = np.arange(256, dtype=np.uint8).reshape((16, 16))
    assert pytest.approx(calculate_shannon_entropy(uniform), 0.01) == 8.0

def test_steganalyze_clean_image(clean_and_stego_images):
    res = steganalyze_image(clean_and_stego_images, "clean.png")
    assert res["width"] == 100
    assert res["height"] == 100
    assert res["risk_score"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    assert "disclaimer" in res
    assert len(res["stego_indicators"]) > 0
