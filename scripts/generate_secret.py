#!/usr/bin/env python3
"""
Скрипт для генерации случайного SECRET_KEY
"""
import secrets
import string

def generate_secret_key(length=64):
    """Генерирует случайный секретный ключ"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

if __name__ == "__main__":
    secret_key = generate_secret_key()
    print("Ваш новый SECRET_KEY:")
    print(secret_key)
    print("\nДобавьте его в .env файл:")
    print(f"SECRET_KEY={secret_key}")

