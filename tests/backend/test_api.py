import io
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_dummy_png_bytes():
    img = Image.new("RGB", (60, 60), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "StegoShield"

def test_embed_and_extract_api_flow():
    png_bytes = create_dummy_png_bytes()

    # 1. Embed request
    embed_response = client.post(
        "/api/steganography/embed",
        files={"cover_image": ("cover.png", png_bytes, "image/png")},
        data={"password": "TestPassword123!", "secret_text": "TopSecretMessage"}
    )
    assert embed_response.status_code == 200
    embed_data = embed_response.json()
    assert embed_data["success"] is True
    assert "stego_filename" in embed_data

    # Download stego file from endpoint
    stego_filename = embed_data["stego_filename"]
    download_response = client.get(f"/api/steganography/download/{stego_filename}")
    assert download_response.status_code == 200
    stego_bytes = download_response.content

    # 2. Extract request
    extract_response = client.post(
        "/api/steganography/extract",
        files={"stego_image": ("stego.png", stego_bytes, "image/png")},
        data={"password": "TestPassword123!"}
    )
    assert extract_response.status_code == 200
    extract_data = extract_response.json()
    assert extract_data["success"] is True
    assert extract_data["recovered_text"] == "TopSecretMessage"

def test_steganalyze_api():
    png_bytes = create_dummy_png_bytes()
    response = client.post(
        "/api/analysis/steganalyze",
        files={"image": ("test.png", png_bytes, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "overall_entropy" in data
    assert "risk_score" in data

def test_dashboard_stats_api():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "images_analyzed" in data
    assert "average_risk_score" in data
