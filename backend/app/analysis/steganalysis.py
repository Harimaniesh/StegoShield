import cv2
import numpy as np
from PIL import Image
from pathlib import Path
from typing import Dict, Any, List, Tuple
from app.security.crypto import compute_file_sha256

def calculate_shannon_entropy(data: np.ndarray) -> float:
    """Calculates Shannon Entropy in bits per byte (0.0 to 8.0)."""
    if data.size == 0:
        return 0.0
    counts = np.bincount(data.flatten(), minlength=256)
    probabilities = counts / data.size
    probabilities = probabilities[probabilities > 0]
    return float(-np.sum(probabilities * np.log2(probabilities)))

def calculate_lsb_ratio(channel_data: np.ndarray) -> float:
    """Calculates the proportion of 1 bits in the LSB of a channel array."""
    lsb = channel_data & 1
    return float(np.mean(lsb))

def chi_square_lsb_test(channel_data: np.ndarray) -> float:
    """
    Performs Chi-Square test on adjacent pixel pairs (2k, 2k+1) frequencies.
    Returns p-value (higher means LSBs are unnaturally uniform/random, indicative of stego).
    """
    counts = np.bincount(channel_data.flatten(), minlength=256)
    chi_square = 0.0
    k_pairs = 0
    for i in range(0, 256, 2):
        observed_even = counts[i]
        observed_odd = counts[i+1]
        expected = (observed_even + observed_odd) / 2.0
        if expected > 0:
            chi_square += ((observed_even - expected) ** 2) / expected
            chi_square += ((observed_odd - expected) ** 2) / expected
            k_pairs += 1
            
    # Normalize chi square statistic
    if k_pairs == 0:
        return 0.0
    return float(chi_square / k_pairs)

def calculate_laplacian_noise(gray_img: np.ndarray) -> float:
    """Calculates high-frequency noise variance using Laplacian operator."""
    laplacian = cv2.Laplacian(gray_img, cv2.CV_64F)
    return float(laplacian.var())

def steganalyze_image(image_path: str, filename: str) -> Dict[str, Any]:
    """
    Executes forensic steganalysis on an image file.
    Returns complete breakdown of metrics, channel statistics, LSB distributions, and risk score.
    """
    file_path = Path(image_path)
    file_size = file_path.stat().st_size
    file_hash = compute_file_sha256(image_path)

    with Image.open(image_path) as img:
        img_rgb = img.convert("RGB")
        width, height = img_rgb.size
        img_np = np.array(img_rgb, dtype=np.uint8)

    channels_data = {
        "Red": img_np[:, :, 0],
        "Green": img_np[:, :, 1],
        "Blue": img_np[:, :, 2]
    }

    overall_entropy = calculate_shannon_entropy(img_np)
    
    channel_stats = {}
    lsb_distribution = {}
    chi_square_stats = {}
    indicators: List[str] = []

    lsb_ratios_list = []
    
    for ch_name, data in channels_data.items():
        ch_entropy = calculate_shannon_entropy(data)
        ch_mean = float(np.mean(data))
        ch_std = float(np.std(data))
        ch_min = int(np.min(data))
        ch_max = int(np.max(data))
        ch_var = float(np.var(data))
        lsb_ratio = calculate_lsb_ratio(data)
        lsb_ratios_list.append(lsb_ratio)
        
        chi_stat = chi_square_lsb_test(data)
        chi_square_stats[ch_name] = chi_stat

        channel_stats[ch_name] = {
            "mean": round(ch_mean, 2),
            "std_dev": round(ch_std, 2),
            "min": ch_min,
            "max": ch_max,
            "entropy": round(ch_entropy, 4),
            "variance": round(ch_var, 2),
            "lsb_ratio": round(lsb_ratio, 4)
        }
        lsb_distribution[ch_name] = round(lsb_ratio * 100.0, 2)

    # Convert to grayscale for noise analysis
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    overall_variance = float(np.var(gray))
    noise_level = calculate_laplacian_noise(gray)

    # Steganalysis Indicator Checks
    risk_points = 0.0

    # Indicator 1: LSB Randomness (Ratio close to 50.0%)
    avg_lsb_ratio = np.mean(lsb_ratios_list)
    lsb_deviation_from_half = abs(avg_lsb_ratio - 0.5)
    if lsb_deviation_from_half < 0.01:
        indicators.append("Extremely high LSB randomness detected (LSB bit balance ~50.0%).")
        risk_points += 40.0
    elif lsb_deviation_from_half < 0.03:
        indicators.append("Moderate LSB entropy anomaly observed.")
        risk_points += 20.0

    # Indicator 2: Channel Entropy Threshold (> 7.95 bits/byte suggests dense encrypted payload)
    if overall_entropy > 7.95:
        indicators.append("Near-maximum Shannon Entropy (>7.95 bits/byte), consistent with encrypted data.")
        risk_points += 30.0
    elif overall_entropy > 7.8:
        indicators.append("Elevated overall entropy (>7.8 bits/byte).")
        risk_points += 15.0

    # Indicator 3: Chi-Square Pairwise Uniformity
    max_chi = max(chi_square_stats.values()) if chi_square_stats else 0
    if max_chi < 0.5:  # Low chi-square statistic indicates pair frequency smoothing from LSB overwrite
        indicators.append("Low Chi-Square pairwise variance (indicates artificial LSB bit distribution).")
        risk_points += 25.0

    # Indicator 4: Noise Level Anomaly
    if noise_level > 500.0:
        indicators.append("High high-frequency noise variance in pixel domain.")
        risk_points += 10.0

    if not indicators:
        indicators.append("No obvious steganographic anomalies detected. Image exhibits standard natural pixel characteristics.")

    # Calculate final risk score
    risk_value = min(100.0, round(risk_points, 1))
    if risk_value >= 70.0:
        risk_score = "CRITICAL"
    elif risk_value >= 45.0:
        risk_score = "HIGH"
    elif risk_value >= 25.0:
        risk_score = "MEDIUM"
    else:
        risk_score = "LOW"

    disclaimer = (
        "Note: This risk score is an analytical statistical indicator based on LSB entropy, "
        "Chi-square pair analysis, and pixel variance. It is not definitive proof of hidden data."
    )

    return {
        "filename": filename,
        "dimensions": f"{width}x{height}",
        "width": width,
        "height": height,
        "channels": 3,
        "file_size_bytes": file_size,
        "sha256_hash": file_hash,
        "overall_entropy": round(overall_entropy, 4),
        "channel_stats": channel_stats,
        "lsb_distribution": lsb_distribution,
        "chi_square_p_value": round(float(np.mean(list(chi_square_stats.values()))), 4),
        "pixel_variance": round(overall_variance, 2),
        "noise_level": round(noise_level, 2),
        "stego_indicators": indicators,
        "risk_score": risk_score,
        "risk_value": risk_value,
        "disclaimer": disclaimer
    }
