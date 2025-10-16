from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import users, stats, debug

app = FastAPI(
    title="Remna Panel Telegram Bot API",
    description="API for managing Remna panel via Telegram Mini App",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(stats.router)
app.include_router(debug.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Remna Panel Telegram Bot API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

