from fastapi import APIRouter, Header, HTTPException, Request
from typing import Optional

router = APIRouter(prefix="/debug", tags=["debug"])

@router.get("/telegram")
async def debug_telegram(
    x_telegram_init_data: Optional[str] = Header(None, alias="X-Telegram-Init-Data")
):
    """Debug endpoint to check Telegram init data"""
    return {
        "has_init_data": bool(x_telegram_init_data),
        "init_data_length": len(x_telegram_init_data) if x_telegram_init_data else 0,
        "init_data_preview": x_telegram_init_data[:100] if x_telegram_init_data else None,
    }

@router.get("/headers")
async def debug_headers(request: Request):
    """Debug endpoint to check all headers"""
    return {
        "all_headers": dict(request.headers),
        "telegram_init_data": request.headers.get("X-Telegram-Init-Data"),
        "user_agent": request.headers.get("User-Agent"),
        "origin": request.headers.get("Origin"),
        "referer": request.headers.get("Referer"),
    }
