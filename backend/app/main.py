import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base
from app.api.steganography import router as steganography_router
from app.api.analysis import router as analysis_router
from app.api.history import router as history_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stegoshield.main")

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc"
)

# Enforce secure CORS policy - permit localhost development origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Security Middleware for standard HTTP security headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Cache-Control"] = "no-store, max-age=0"
    return response

# Include API Routers
app.include_router(steganography_router, prefix=settings.API_PREFIX)
app.include_router(analysis_router, prefix=settings.API_PREFIX)
app.include_router(history_router, prefix=settings.API_PREFIX)

@app.get(f"{settings.API_PREFIX}/health", tags=["health"])
def health_check():
    """Health check endpoint for service status monitoring."""
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "secure_educational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
