import pytest
from app.security.crypto import encrypt_payload, decrypt_payload, derive_key, compute_sha256

def test_derive_key_deterministic():
    salt = b"0123456789abcdef"
    key1 = derive_key("Password123!", salt)
    key2 = derive_key("Password123!", salt)
    assert key1 == key2
    assert len(key1) == 32  # 256 bits

def test_aes_gcm_encrypt_decrypt_text():
    password = "SuperSecretPassword"
    plaintext = b"StegoShield Secure Payload 2026"
    
    ciphertext, salt, nonce = encrypt_payload(plaintext, password)
    assert ciphertext != plaintext
    assert len(salt) == 16
    assert len(nonce) == 12

    recovered = decrypt_payload(ciphertext, password, salt, nonce)
    assert recovered == plaintext

def test_aes_gcm_invalid_password_raises_error():
    password = "CorrectPassword"
    wrong_pass = "WrongPassword"
    plaintext = b"Sensitive forensic data"

    ciphertext, salt, nonce = encrypt_payload(plaintext, password)
    
    with pytest.raises(ValueError, match="Decryption failed"):
        decrypt_payload(ciphertext, wrong_pass, salt, nonce)

def test_sha256_hash():
    data = b"Hello StegoShield"
    hash_str = compute_sha256(data)
    assert len(hash_str) == 64
    assert hash_str == compute_sha256(data)
