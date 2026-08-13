import hashlib
import os
import secrets
from typing import Tuple
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Constants
SALT_SIZE = 16
NONCE_SIZE = 12  # 96 bits for GCM
KEY_SIZE = 32    # 256-bit key
PBKDF2_ITERATIONS = 100_000

def derive_key(password: str, salt: bytes) -> bytes:
    """Derives a 256-bit AES key from password and salt using PBKDF2-HMAC-SHA256."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=KEY_SIZE,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )
    return kdf.derive(password.encode('utf-8'))

def encrypt_payload(plaintext: bytes, password: str) -> Tuple[bytes, bytes, bytes]:
    """
    Encrypts plaintext bytes using AES-256-GCM.
    Returns (ciphertext, salt, nonce).
    """
    salt = secrets.token_bytes(SALT_SIZE)
    nonce = secrets.token_bytes(NONCE_SIZE)
    key = derive_key(password, salt)
    
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return ciphertext, salt, nonce

def decrypt_payload(ciphertext: bytes, password: str, salt: bytes, nonce: bytes) -> bytes:
    """
    Decrypts ciphertext bytes using AES-256-GCM.
    Raises ValueError if decryption fails or authentication tag is invalid.
    """
    if len(salt) != SALT_SIZE or len(nonce) != NONCE_SIZE:
        raise ValueError("Invalid salt or nonce size")
        
    try:
        key = derive_key(password, salt)
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext
    except Exception as e:
        raise ValueError("Decryption failed. Incorrect password or corrupted payload.") from e

def compute_sha256(data: bytes) -> str:
    """Computes SHA-256 hex digest of data."""
    return hashlib.sha256(data).hexdigest()

def compute_file_sha256(filepath: str) -> str:
    """Computes SHA-256 hex digest of a file on disk."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()
