import hashlib
import hmac
from urllib.parse import parse_qsl
from fastapi import Header, HTTPException, status
from typing import Optional
from app.core.config import settings


def verify_telegram_init_data(init_data: str) -> dict:
    """
    Verify Telegram WebApp init data
    Returns user data if valid
    """
    try:
        parsed_data = dict(parse_qsl(init_data))
        
        # Extract hash
        received_hash = parsed_data.pop('hash', None)
        if not received_hash:
            raise ValueError("No hash in init_data")
        
        # Create data check string
        data_check_arr = [f"{k}={v}" for k, v in sorted(parsed_data.items())]
        data_check_string = '\n'.join(data_check_arr)
        
        # Create secret key
        secret_key = hmac.new(
            "WebAppData".encode(),
            settings.TELEGRAM_BOT_TOKEN.encode(),
            hashlib.sha256
        ).digest()
        
        # Calculate hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Verify hash
        if calculated_hash != received_hash:
            raise ValueError("Invalid hash")
        
        # Parse user data
        import json
        user_data = json.loads(parsed_data.get('user', '{}'))
        
        return user_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Telegram init data: {str(e)}"
        )


async def verify_admin(
    x_telegram_init_data: Optional[str] = Header(None, alias="X-Telegram-Init-Data")
) -> dict:
    """
    Dependency to verify admin access via Telegram
    Проверяет что запрос идет из Telegram Mini App и user ID есть в списке админов
    """
    print(f"🔍 Auth check: init_data present: {bool(x_telegram_init_data)}, env: {settings.ENVIRONMENT}")
    
    # Проверяем наличие init_data
    if not x_telegram_init_data:
        # В development можно открыть через браузер
        if settings.ENVIRONMENT == "development":
            print("⚠️ Development: No init_data, returning dev user")
            return {"id": 123456789, "first_name": "Dev User", "is_dev": True}
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access denied. This app must be opened via Telegram Mini App."
        )
    
    # Проверяем подпись init_data
    try:
        user_data = verify_telegram_init_data(x_telegram_init_data)
        print(f"✅ Telegram user verified: {user_data.get('id')} ({user_data.get('first_name')})")
    except Exception as e:
        print(f"❌ Telegram verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram authentication data. Please reopen the app."
        )
    
    # Проверяем, что пользователь - администратор
    user_id = user_data.get('id')
    admin_ids = settings.admin_ids_list
    
    print(f"🔍 Checking admin access: user_id={user_id}, admin_ids={admin_ids}")
    
    if not admin_ids:
        print("⚠️ Warning: ADMIN_TELEGRAM_IDS not configured!")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error. Please contact administrator."
        )
    
    if user_id not in admin_ids:
        print(f"❌ Access denied: user_id {user_id} not in admin list")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Your Telegram ID ({user_id}) is not authorized to access this panel."
        )
    
    print(f"✅ Admin access granted for user_id {user_id}")
    return user_data


async def optional_admin(
    x_telegram_init_data: Optional[str] = Header(None, alias="X-Telegram-Init-Data")
) -> Optional[dict]:
    """
    Optional admin check - returns user data if provided, None otherwise
    """
    if not x_telegram_init_data:
        return None
    
    try:
        user_data = verify_telegram_init_data(x_telegram_init_data)
        return user_data
    except:
        return None

