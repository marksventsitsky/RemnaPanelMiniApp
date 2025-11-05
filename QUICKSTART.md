# 🚀 Quick Start - Развертывание за 5 минут

## На сервере с Remna Panel

```bash
# 1. Клонируем проект
cd /opt/remnawave
git clone https://github.com/marksventsitsky/RemnaPanelMiniApp.git
cd RemnaPanelMiniApp

# 2. Настраиваем .env
cp .env.example .env
nano .env
```

**Заполните:**
```env
REMNA_PANEL_URL=https://panel.example.com
REMNA_API_TOKEN=ваш_api_токен
TELEGRAM_BOT_TOKEN=токен_от_BotFather
ADMIN_TELEGRAM_IDS=ваш_telegram_id
SECRET_KEY=$(openssl rand -hex 32)
ENVIRONMENT=production
```

```bash
# 3. Создаем сеть (если нужно)
docker network create remnawave-network

# 4. Запускаем
docker-compose up -d --build

# 5. Проверяем логи
docker-compose logs -f remna-miniapp
```

## Nginx конфигурация

Создайте `/opt/remnawave/nginx/conf.d/miniapp.conf`:

```nginx
upstream remna-miniapp {
    server remna-miniapp:8000;
}

server {
    server_name miniapp.example.com;
    listen 443 ssl http2;
    
    ssl_certificate /etc/nginx/ssl/miniapp_fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/miniapp_privkey.key;
    
    location / {
        proxy_pass http://remna-miniapp;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Перезапустить Nginx
docker-compose -f /opt/remnawave/docker-compose.yml restart nginx
```

## SSL сертификат

```bash
# Получить сертификат через acme.sh
acme.sh --issue -d miniapp.example.com --webroot /var/www/html

# Установить в Nginx
acme.sh --install-cert -d miniapp.example.com \
  --key-file /opt/remnawave/nginx/ssl/miniapp_privkey.key \
  --fullchain-file /opt/remnawave/nginx/ssl/miniapp_fullchain.pem \
  --reloadcmd "docker-compose -f /opt/remnawave/docker-compose.yml restart nginx"
```

## Настройка бота

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/mybots` → выберите бота
3. `Bot Settings` → `Menu Button`
4. `Edit Menu Button URL` → `https://miniapp.example.com`
5. `Edit Menu Button Text` → `Открыть панель`

## Готово! 🎉

Откройте бота в Telegram и нажмите кнопку меню!

---

## Обновление

```bash
cd /opt/remnawave/RemnaPanelMiniApp
docker-compose down
git pull
docker-compose up -d --build
```

## Troubleshooting

### Логи
```bash
docker-compose logs -f remna-miniapp
```

### Перезапуск
```bash
docker-compose restart remna-miniapp
```

### Полная пересборка
```bash
docker-compose down
docker-compose up -d --build --force-recreate
```

### Очистка кэша Telegram
Настройки → Данные и память → Очистить кэш

---

📖 Полная документация: [README.md](README.md)

