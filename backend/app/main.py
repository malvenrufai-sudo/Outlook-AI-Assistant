"""FastAPI app with global error handling and health checks"""
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import email
from app.models.settings import settings

app = FastAPI(
    title="Outlook AI Add-in Backend",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS: localhost dev + Outlook domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(email.router, prefix="/api", tags=["Email AI"])


@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": "0.1.0",
        "ai_provider": settings.AI_PROVIDER,
    }


# Global error handlers
@app.exception_handler(Exception)
async def unhandled_error(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions"""
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc) if settings.DEBUG else None},
    )


@app.exception_handler(422)
async def validation_error(request: Request, exc: Exception):
    """Friendly 422 responses"""
    return JSONResponse(
        status_code=422,
        content={"error": "Invalid request", "detail": str(exc)},
    )
