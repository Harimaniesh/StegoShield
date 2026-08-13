import struct
import numpy as np
from PIL import Image
from pathlib import Path
from typing import Tuple, Optional, Dict, Any
from app.security.crypto import encrypt_payload, decrypt_payload, compute_sha256

MAGIC_HEADER = b"STGO"  # 4 bytes
PAYLOAD_TYPE_TEXT = 1
PAYLOAD_TYPE_FILE = 2

def calculate_image_capacity(image_path: str) -> Dict[str, Any]:
    """
    Calculates image dimensions, channels, total LSB capacity, and SHA-256 hash.
    """
    with Image.open(image_path) as img:
        img_rgb = img.convert("RGB")
        width, height = img_rgb.size
        channels = 3  # R, G, B
        total_bits = width * height * channels
        total_bytes = total_bits // 8
        
        # Header overhead: Magic(4) + Type(1) + ExtLen(1) + Ext(10) + Salt(16) + Nonce(12) + CipherLen(4) = ~48 bytes
        header_overhead = 48
        max_payload_bytes = max(0, total_bytes - header_overhead)
        
        return {
            "width": width,
            "height": height,
            "dimensions": f"{width}x{height}",
            "format": img.format or "PNG",
            "channels": channels,
            "total_capacity_bytes": total_bytes,
            "max_payload_bytes": max_payload_bytes,
        }

def bytes_to_bits(data: bytes) -> np.ndarray:
    """Converts a bytes object into a numpy array of bits (0s and 1s)."""
    array = np.frombuffer(data, dtype=np.uint8)
    return np.unpackbits(array)

def bits_to_bytes(bits: np.ndarray) -> bytes:
    """Converts a numpy array of bits (0s and 1s) back to bytes."""
    return np.packbits(bits).tobytes()

def embed_lsb(
    cover_image_path: str,
    output_image_path: str,
    secret_data: bytes,
    password: str,
    is_file: bool = False,
    file_ext: str = ".txt"
) -> Dict[str, Any]:
    """
    Encrypts secret payload using AES-256-GCM and embeds it into cover image using LSB steganography.
    """
    # 1. Encrypt payload
    ciphertext, salt, nonce = encrypt_payload(secret_data, password)
    
    # 2. Build header
    payload_type = PAYLOAD_TYPE_FILE if is_file else PAYLOAD_TYPE_TEXT
    ext_clean = file_ext.lower()[:10].encode('utf-8')  # Max 10 chars ext
    ext_len = len(ext_clean)
    
    # Format: MAGIC(4s) + Type(B) + ExtLen(B) + Ext(10s) + Salt(16s) + Nonce(12s) + CipherLen(I)
    header = struct.pack(
        ">4sBB10s16s12sI",
        MAGIC_HEADER,
        payload_type,
        ext_len,
        ext_clean.ljust(10, b'\x00'),
        salt,
        nonce,
        len(ciphertext)
    )
    
    full_payload = header + ciphertext
    payload_bits = bytes_to_bits(full_payload)
    
    # 3. Load image & check capacity
    with Image.open(cover_image_path) as img:
        img_rgb = img.convert("RGB")
        width, height = img_rgb.size
        img_array = np.array(img_rgb, dtype=np.uint8)
        
    total_available_bits = width * height * 3
    if len(payload_bits) > total_available_bits:
        raise ValueError(
            f"Payload size ({len(payload_bits) // 8} bytes) exceeds image capacity ({total_available_bits // 8} bytes)."
        )

    # 4. Embed bits into LSB of RGB channels
    flat_pixels = img_array.flatten()
    
    # Modify LSBs for payload_bits length
    flat_pixels[:len(payload_bits)] = (flat_pixels[:len(payload_bits)] & ~1) | payload_bits
    
    # Reshape back to image dimensions
    stego_array = flat_pixels.reshape((height, width, 3))
    stego_image = Image.fromarray(stego_array, mode="RGB")
    
    # Always save as PNG to maintain lossless LSB accuracy
    stego_image.save(output_image_path, format="PNG")
    
    payload_sha256 = compute_sha256(secret_data)
    
    return {
        "payload_size_bytes": len(secret_data),
        "total_embedded_bytes": len(full_payload),
        "sha256_hash": payload_sha256,
        "width": width,
        "height": height,
        "dimensions": f"{width}x{height}",
    }

def extract_lsb(
    stego_image_path: str,
    password: str
) -> Dict[str, Any]:
    """
    Extracts embedded LSB data from stego image and decrypts it with AES-256-GCM.
    Raises ValueError on incorrect magic header, corrupted payload, or invalid password.
    """
    with Image.open(stego_image_path) as img:
        img_rgb = img.convert("RGB")
        img_array = np.array(img_rgb, dtype=np.uint8)
        
    flat_pixels = img_array.flatten()
    
    # 1. Extract first header block bits (header size = 4 + 1 + 1 + 10 + 16 + 12 + 4 = 48 bytes = 384 bits)
    header_bytes_len = struct.calcsize(">4sBB10s16s12sI")  # 48 bytes
    header_bits_len = header_bytes_len * 8
    
    if len(flat_pixels) < header_bits_len:
        raise ValueError("Image is too small to contain a StegoShield payload.")
        
    header_bits = flat_pixels[:header_bits_len] & 1
    header_bytes = bits_to_bytes(header_bits)
    
    magic, payload_type, ext_len, ext_raw, salt, nonce, cipher_len = struct.unpack(
        ">4sBB10s16s12sI", header_bytes
    )
    
    if magic != MAGIC_HEADER:
        raise ValueError("No valid StegoShield hidden payload detected in this image.")
        
    ext_clean = ext_raw[:ext_len].decode('utf-8', errors='ignore')
    
    # 2. Extract ciphertext bits
    total_bits_needed = (header_bytes_len + cipher_len) * 8
    if len(flat_pixels) < total_bits_needed:
        raise ValueError("Corrupted image: truncated payload stream.")
        
    cipher_bits = flat_pixels[header_bits_len:total_bits_needed] & 1
    ciphertext = bits_to_bytes(cipher_bits)
    
    # 3. Decrypt ciphertext using PBKDF2 key derivation & AES-256-GCM
    plaintext = decrypt_payload(ciphertext, password, salt, nonce)
    
    is_file = (payload_type == PAYLOAD_TYPE_FILE)
    payload_sha256 = compute_sha256(plaintext)
    
    return {
        "is_file": is_file,
        "payload_type": "file" if is_file else "text",
        "file_extension": ext_clean if is_file else ".txt",
        "recovered_bytes": plaintext,
        "payload_size_bytes": len(plaintext),
        "sha256_hash": payload_sha256
    }
