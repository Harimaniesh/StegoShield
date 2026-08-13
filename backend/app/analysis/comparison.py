import cv2
import numpy as np
from PIL import Image
from pathlib import Path
from typing import Dict, Any

def compare_images(
    original_path: str,
    stego_path: str,
    output_diff_path: str
) -> Dict[str, Any]:
    """
    Compares original image and stego image forensically.
    Generates pixel difference map and returns comparative metrics.
    """
    orig_file = Path(original_path)
    stego_file = Path(stego_path)

    orig_size = orig_file.stat().st_size
    stego_size = stego_file.stat().st_size

    with Image.open(original_path) as img1, Image.open(stego_path) as img2:
        img1_rgb = img1.convert("RGB")
        img2_rgb = img2.convert("RGB")
        
        w1, h1 = img1_rgb.size
        w2, h2 = img2_rgb.size

        img1_np = np.array(img1_rgb, dtype=np.float64)
        img2_np = np.array(img2_rgb, dtype=np.float64)

    dimensions_match = (w1 == w2 and h1 == h2)

    if not dimensions_match:
        # Resize stego image to match original for comparison purposes if needed
        img2_resized = cv2.resize(np.array(img2_rgb), (w1, h1))
        img2_np = np.array(img2_resized, dtype=np.float64)

    # 1. Absolute pixel difference per channel
    abs_diff = np.abs(img1_np - img2_np)
    mae = float(np.mean(abs_diff))

    # 2. Mean Squared Error (MSE) & PSNR calculation
    mse = float(np.mean((img1_np - img2_np) ** 2))
    if mse == 0:
        psnr = 999.0  # Infinite PSNR (identical images)
    else:
        max_pixel = 255.0
        psnr = float(10.0 * np.log10((max_pixel ** 2) / mse))

    # 3. Changed pixels count & percentage (pixel changed if any RGB channel differs)
    diff_mask = np.any(abs_diff > 0, axis=2)
    changed_pixels_count = int(np.sum(diff_mask))
    total_pixels = w1 * h1
    changed_pixels_percentage = float((changed_pixels_count / total_pixels) * 100.0)

    # 4. Generate Visual Difference Map (Amplified heatmap)
    # Scale difference by 25 to make subtle 1-bit LSB modifications visually distinct (colored in glowing cyan/magenta)
    amplified_diff = np.uint8(np.clip(abs_diff * 25, 0, 255))
    
    # Convert difference mask into an intense jet/viridis heatmap
    heatmap = cv2.applyColorMap(np.uint8(np.mean(amplified_diff, axis=2)), cv2.COLORMAP_JET)
    
    # Save difference heatmap image
    cv2.imwrite(output_diff_path, heatmap)

    return {
        "dimensions_match": dimensions_match,
        "original_dimensions": f"{w1}x{h1}",
        "stego_dimensions": f"{w2}x{h2}",
        "mean_absolute_error": round(mae, 4),
        "peak_signal_noise_ratio": round(psnr, 2),
        "changed_pixels_count": changed_pixels_count,
        "changed_pixels_percentage": round(changed_pixels_percentage, 4),
        "original_file_size": orig_size,
        "stego_file_size": stego_size,
        "file_size_diff_bytes": stego_size - orig_size
    }
