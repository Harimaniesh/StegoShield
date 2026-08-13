import pytest
import numpy as np
from PIL import Image
from app.analysis.comparison import compare_images

@pytest.fixture
def pair_images(tmp_path):
    orig_path = str(tmp_path / "orig.png")
    stego_path = str(tmp_path / "stego.png")
    diff_path = str(tmp_path / "diff.png")

    img1 = np.ones((50, 50, 3), dtype=np.uint8) * 100
    img2 = img1.copy()
    # Modify 10 pixels in img2
    img2[0, 0:10, 0] = 101

    Image.fromarray(img1).save(orig_path)
    Image.fromarray(img2).save(stego_path)

    return orig_path, stego_path, diff_path

def test_compare_images_metrics(pair_images):
    orig_path, stego_path, diff_path = pair_images
    res = compare_images(orig_path, stego_path, diff_path)

    assert res["dimensions_match"] is True
    assert res["changed_pixels_count"] == 10
    assert res["changed_pixels_percentage"] == (10 / (50 * 50)) * 100.0
    assert res["mean_absolute_error"] > 0
    assert res["peak_signal_noise_ratio"] < 999.0
