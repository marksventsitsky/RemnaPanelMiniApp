# Remna Panel - Telegram Mini App

Панель управления для Remna Panel, которая работает прямо в Telegram как Mini App.

## Что это?

Это веб-приложение, которое подключается к вашей панели Remna и позволяет управлять пользователями через Telegram бота. Вы можете создавать новых пользователей, смотреть статистику, редактировать настройки, управлять сквадами - все это прямо из Telegram.

## Развертывание на сервере с Remna Panel

### 1. Клонирование проекта

```bash
cd /opt/remnawave
git clone https://github.com/marksventsitsky/RemnaPanelMiniApp.git
cd RemnaPanelMiniApp
```

### 2. Настройка переменных окружения

```bash
# Переименуйте файл env
mv .env.miniapp .env

# Отредактируйте переменные
nano .env
```

Заполните следующие переменные:

```env
# URL вашей панели Remna
REMNA_PANEL_URL=https://panel.example.com

# API токен из настроек Remna Panel (Settings -> API -> Create Token)
REMNA_API_TOKEN=your_api_token_here

# Токен бота от @BotFather
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Ваш Telegram ID (узнать: https://t.me/userinfobot)
ADMIN_TELEGRAM_IDS=123456789

# Секретный ключ для JWT (сгенерировать: python3 scripts/generate_secret.py)
SECRET_KEY=your_secret_key_here

# Домен для Mini App
MINIAPP_DOMAIN=miniapp.example.com

# Режим работы
ENVIRONMENT=production
```

### 3. Настройка SSL сертификатов

```bash
# Создайте сертификаты для поддомена
acme.sh --issue -d miniapp.example.com --nginx

# Скопируйте сертификаты в nginx
cp /root/.acme.sh/miniapp.example.com_ecc/fullchain.cer /opt/remnawave/nginx/ssl/miniapp_fullchain.pem
cp /root/.acme.sh/miniapp.example.com_ecc/miniapp.example.com.key /opt/remnawave/nginx/ssl/miniapp_privkey.key
```

### 4. Настройка Nginx

Добавьте в `/opt/remnawave/nginx/nginx.conf` (в конец файла, перед закрывающей `}`):

```nginx
upstream remna-miniapp {
    server remna-miniapp-frontend:80;
}

server {
    server_name miniapp.example.com;
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    location / {
        proxy_http_version 1.1;
        proxy_pass http://remna-miniapp;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_dhparam "/etc/nginx/ssl/dhparam.pem";
    ssl_certificate "/etc/nginx/ssl/miniapp_fullchain.pem";
    ssl_certificate_key "/etc/nginx/ssl/miniapp_privkey.key";

    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;
}
```

### 5. Запуск Mini App

```bash
# Запустите контейнеры
docker-compose down
docker-compose up -d --build

# Перезагрузите Nginx
docker exec remnawave-nginx nginx -s reload
```

### 6. Настройка Telegram бота

1. Откройте [@BotFather](https://t.me/botfather)
2. Найдите своего бота
3. Выполните команду `/setmenubutton`
4. Укажите URL: `https://miniapp.example.com`

## Локальная разработка

```bash
# Клонируйте проект
git clone https://github.com/marksventsitsky/RemnaPanelMiniApp.git
cd RemnaPanelMiniApp

# Настройте переменные
cp .env.miniapp.example .env
nano .env

# Запустите
docker-compose up -d
```

Приложение будет доступно на `http://localhost:8080`

## Возможности

✅ **Управление пользователями:**

- Создание новых пользователей с шаблонами трафика и времени
- Редактирование существующих пользователей
- Удаление пользователей с подтверждением
- Просмотр детальной информации о пользователях

✅ **Управление трафиком:**

- Настройка лимитов трафика (включая безлимит)
- Сброс использованного трафика
- Отображение прогресса использования

✅ **Управление группами:**

- Назначение пользователей в сквады (группы)
- Просмотр участников групп

✅ **Дополнительные функции:**

- Копирование ссылок на подписки
- Настройка даты истечения подписки
- Адаптивный дизайн для мобильных устройств
- Безопасная авторизация через Telegram

## Использование

1. Откройте вашего бота в Telegram
2. Нажмите кнопку меню (Menu Button)
3. Управляйте пользователями прямо в Telegram

**Важно:** Доступ к панели имеют только пользователи, чьи Telegram ID указаны в `ADMIN_TELEGRAM_IDS`.

## Архитектура

```
┌─────────────────┐
│  Telegram Bot   │  ← Пользователь открывает Mini App
└────────┬────────┘
         │
┌────────▼────────┐
│   Mini App      │  ← React + Mantine UI (Frontend)
│   Frontend      │    Проверяет Telegram initData
└────────┬────────┘
         │ API calls
┌────────▼────────┐
│   Backend API   │  ← FastAPI + Telegram auth
│   (Mini App)    │    Валидирует admin access
└────────┬────────┘
         │
┌────────▼────────┐
│  Remna Panel    │  ← Ваша основная панель
│      API        │    Обрабатывает запросы
└─────────────────┘
```

## Обновление

```bash
cd /opt/remnawave/RemnaPanelMiniApp
git pull
docker-compose down
docker-compose up -d --build
docker exec remnawave-nginx nginx -s reload
```

## Требования

- **Сервер с Docker и Docker Compose**
- **Работающая панель Remna** с API доступом
- **Telegram бот** (созданный через @BotFather)
- **Nginx с SSL** (для production)
- **Домен** для Mini App (например, `miniapp.yourdomain.com`)

## Устранение неполадок

### Ошибка "Access denied"

- Проверьте, что ваш Telegram ID указан в `ADMIN_TELEGRAM_IDS`
- Убедитесь, что открываете приложение через Telegram бота

### Ошибка "Invalid hash"

- Проверьте, что `TELEGRAM_BOT_TOKEN` совпадает с токеном бота в @BotFather
- Убедитесь, что URL Mini App настроен правильно в боте

### Ошибка 502 Bad Gateway

- Проверьте, что контейнеры запущены: `docker-compose ps`
- Проверьте логи: `docker-compose logs remna-miniapp-backend`

### SSL ошибки

- Убедитесь, что сертификаты скопированы в правильную директорию
- Проверьте права доступа к файлам сертификатов

## Безопасность

- 🔒 **API токен Remna Panel** храните в секрете
- 🔒 **Используйте HTTPS** в production
- 🔒 **Указывайте только доверенных администраторов** в `ADMIN_TELEGRAM_IDS`
- 🔒 **Регулярно обновляйте зависимости**
- 🔒 **Telegram initData** проверяется на каждой запросе

## Лицензия

MIT License
