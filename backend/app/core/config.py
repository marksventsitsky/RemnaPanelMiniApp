from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Remna Panel Settings
    REMNA_PANEL_URL: str
    REMNA_API_TOKEN: str
    
    # Telegram Settings
    TELEGRAM_BOT_TOKEN: str
    ADMIN_TELEGRAM_IDS: str = ""
    
    # App Settings
    SECRET_KEY: str
    ENVIRONMENT: str = "development"
    
    @property
    def admin_ids_list(self) -> List[int]:
        """Convert ADMIN_TELEGRAM_IDS string to list of integers"""
        if not self.ADMIN_TELEGRAM_IDS:
            return []
        return [int(id.strip()) for id in self.ADMIN_TELEGRAM_IDS.split(",") if id.strip()]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

