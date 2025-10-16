#!/usr/bin/env python3
"""
Скрипт для проверки переменных окружения
"""
import os
from pathlib import Path

def check_env():
    """Проверяет наличие и корректность переменных окружения"""
    env_path = Path(__file__).parent.parent / '.env'
    
    if not env_path.exists():
        print("❌ Файл .env не найден!")
        print("📝 Создайте файл .env на основе .env.example")
        return False
    
    required_vars = [
        'REMNA_PANEL_URL',
        'REMNA_API_TOKEN',
        'TELEGRAM_BOT_TOKEN',
        'ADMIN_TELEGRAM_IDS',
        'SECRET_KEY',
    ]
    
    # Загружаем .env
    from dotenv import load_dotenv
    load_dotenv(env_path)
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if not value or value.startswith('your-'):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Следующие переменные не настроены:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\n📝 Отредактируйте файл .env и укажите правильные значения")
        return False
    
    print("✅ Все необходимые переменные окружения настроены!")
    
    # Показываем информацию об админах
    admin_ids = os.getenv('ADMIN_TELEGRAM_IDS', '')
    if admin_ids:
        ids_list = [id.strip() for id in admin_ids.split(',') if id.strip()]
        print(f"\n👥 Админы: {len(ids_list)} ID(s)")
        for admin_id in ids_list:
            print(f"   - {admin_id}")
    else:
        print("\n⚠️  ADMIN_TELEGRAM_IDS не настроен - доступ будет открыт всем!")
    
    # Проверяем доступность Remna API
    print("\n🔍 Проверка подключения к Remna API...")
    import httpx
    
    try:
        remna_url = os.getenv('REMNA_PANEL_URL').rstrip('/')
        remna_token = os.getenv('REMNA_API_TOKEN')
        
        # Пробуем разные эндпоинты
        endpoints_to_try = [
            '/api/users',          # Список пользователей
            '/api/system/stats',   # Системная статистика (новый)
            '/api/core',           # Информация о ядре
            '/api/system',         # Системная информация
            '/api/admins/current', # Текущий админ
        ]
        
        success = False
        for endpoint in endpoints_to_try:
            try:
                response = httpx.get(
                    f"{remna_url}{endpoint}",
                    headers={"Authorization": f"Bearer {remna_token}"},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    print(f"✅ Подключение к Remna API успешно!")
                    print(f"   Рабочий эндпоинт: {endpoint}")
                    success = True
                    break
                elif response.status_code == 401:
                    print(f"❌ Ошибка авторизации (401)")
                    print(f"   Проверьте REMNA_API_TOKEN")
                    return False
                elif response.status_code == 403:
                    print(f"❌ Доступ запрещен (403)")
                    print(f"   У токена недостаточно прав")
                    return False
            except httpx.ConnectError:
                print(f"❌ Не удалось подключиться к {remna_url}")
                print(f"   Проверьте REMNA_PANEL_URL")
                return False
            except Exception:
                continue
        
        if not success:
            print(f"⚠️  Не удалось найти рабочий эндпоинт")
            print(f"   Попробованные эндпоинты: {', '.join(endpoints_to_try)}")
            print(f"\n💡 Это нормально, если панель использует другие эндпоинты.")
            print(f"   Приложение все равно должно работать.")
            print(f"\n   Для проверки вручную:")
            print(f"   curl -H 'Authorization: Bearer YOUR_TOKEN' {remna_url}/api/users")
            
    except Exception as e:
        print(f"❌ Ошибка подключения к Remna API: {e}")
        print("   Проверьте REMNA_PANEL_URL и REMNA_API_TOKEN")
    
    return True

if __name__ == "__main__":
    check_env()

