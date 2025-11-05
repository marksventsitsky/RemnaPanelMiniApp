# Remna Panel - Telegram Mini App

Панель управления для Remna Panel, которая работает прямо в Telegram как Mini App.

## 🚀 Технологии

- **Runtime:** Bun 🔥 (быстрее Node.js в 4x раза!)
- **Backend:** TypeScript + Express
- **Frontend:** React + TypeScript + Vite + Mantine UI
- **Deployment:** Docker (единый контейнер для фронта и бэка)
- **Auth:** Telegram Mini App WebApp InitData

## Что это?

Это веб-приложение, которое подключается к вашей панели Remna и позволяет управлять пользователями через Telegram бота. Вы можете создавать новых пользователей, смотреть статистику, редактировать настройки, управлять сквадами - все это прямо из Telegram.

## Развертывание на сервере с Remna Panel

### Требования

- Сервер с установленным Docker и Docker Compose
- Установленная и работающая Remna Panel
- Доступ к серверу по SSH
- Домен/субдомен для Mini App (например, `miniapp.example.com`)
- SSL сертификат для домена (обязательно для Telegram Mini App!)

### 1. Клонирование проекта

```bash
cd /opt/remnawave
git clone https://github.com/marksventsitsky/RemnaPanelMiniApp.git
cd RemnaPanelMiniApp
```

### 2. Настройка переменных окружения

```bash
# Скопируйте пример
cp .env.example .env

# Отредактируйте переменные
nano .env
```

Заполните следующие переменные:

```env
# URL вашей панели Remna (без /api)
REMNA_PANEL_URL=https://panel.example.com

# API токен из настроек Remna Panel (Settings -> API -> Create Token)
REMNA_API_TOKEN=your_api_token_here

# Токен бота от @BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Ваш Telegram ID (узнать: https://t.me/userinfobot)
# Можно указать несколько через запятую: 123456789,987654321
ADMIN_TELEGRAM_IDS=123456789

# Секретный ключ (сгенерируйте случайную строку)
SECRET_KEY=$(openssl rand -hex 32)

# Режим работы
ENVIRONMENT=production

# Порт (по умолчанию 8000)
PORT=8000
```

### 3. Создание Docker сети (если не существует)

```bash
docker network create remnawave-network
```

### 4. Сборка и запуск

```bash
# Сборка и запуск контейнера
docker-compose up -d --build
```

Проверка логов:

```bash
docker-compose logs -f remna-miniapp
```

### 5. Настройка Nginx на сервере

Создайте конфигурацию для вашего Mini App:

```bash
nano /opt/remnawave/nginx/conf.d/miniapp.conf
```

Добавьте:

```nginx
upstream remna-miniapp {
    server remna-miniapp:8000;
}

server {
    server_name miniapp.example.com;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/miniapp_fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/miniapp_privkey.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy to Mini App container
    location / {
        proxy_pass http://remna-miniapp;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name miniapp.example.com;
    return 301 https://$server_name$request_uri;
}
```

Перезапустите Nginx:

```bash
docker-compose -f /opt/remnawave/docker-compose.yml restart nginx
```

### 6. Получение SSL сертификата

Если у вас еще нет SSL сертификата для субдомена:

```bash
# Установите acme.sh (если не установлен)
curl https://get.acme.sh | sh
source ~/.bashrc

# Получите сертификат
acme.sh --issue -d miniapp.example.com --webroot /var/www/html

# Установите сертификат в Nginx
acme.sh --install-cert -d miniapp.example.com \
  --key-file /opt/remnawave/nginx/ssl/miniapp_privkey.key \
  --fullchain-file /opt/remnawave/nginx/ssl/miniapp_fullchain.pem \
  --reloadcmd "docker-compose -f /opt/remnawave/docker-compose.yml restart nginx"
```

### 7. Настройка Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/mybots` → выберите вашего бота
3. Выберите `Bot Settings` → `Menu Button`
4. Выберите `Edit Menu Button URL`
5. Введите URL: `https://miniapp.example.com`
6. Выберите `Edit Menu Button Text`
7. Введите текст: `Открыть панель` (или любой другой)

### 8. Готово! 🎉

Теперь откройте вашего бота в Telegram и нажмите кнопку меню - откроется ваша панель управления!

## Обновление

```bash
cd /opt/remnawave/RemnaPanelMiniApp

# Остановить контейнер
docker-compose down

# Обновить код
git pull

# Пересобрать и запустить
docker-compose up -d --build
```

## Локальная разработка

### Требования

- Bun >= 1.0.0 ([Установка](https://bun.sh))

### Установка

```bash
# Установите зависимости
bun install

# Скопируйте .env.example в .env и заполните
cp .env.example .env
nano .env

# Установите ENVIRONMENT=development для локальной разработки
```

### Запуск

```bash
# Backend (TypeScript с hot reload)
bun run dev

# Frontend (в отдельном терминале)
cd frontend
bun install
bun run dev
```

Backend будет доступен на `http://localhost:8000`  
Frontend будет доступен на `http://localhost:5173`

> **Почему Bun?** Bun - это современный JavaScript runtime, который в 4 раза быстрее Node.js! Он включает встроенный bundler, test runner и package manager.

## Структура проекта

```
.
├── backend/               # Backend TypeScript
│   ├── server.ts          # Express app + static serving
│   ├── config.ts          # Environment configuration
│   ├── auth.ts            # Telegram auth middleware
│   ├── remnaClient.ts     # Remna API client
│   ├── types.ts           # Shared TypeScript types
│   └── routes/
│       ├── users.ts       # User management endpoints
│       └── stats.ts       # Statistics endpoints
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── Dockerfile             # Multi-stage Bun build
├── docker-compose.yml     # Single container deployment
├── package.json           # Root package.json (Bun)
└── tsconfig.json          # TypeScript config
```

## Troubleshooting

### Ошибка: "Access denied"

- Проверьте, что ваш Telegram ID добавлен в `ADMIN_TELEGRAM_IDS`
- Узнать свой ID: https://t.me/userinfobot
- Можно указать несколько ID через запятую: `123456789,987654321`

### Ошибка: "Failed to fetch stats"

- Проверьте, что `REMNA_API_TOKEN` валиден
- Проверьте, что `REMNA_PANEL_URL` доступен из контейнера
- Проверьте логи: `docker-compose logs -f remna-miniapp`

### Контейнер не запускается

```bash
# Проверьте логи
docker-compose logs remna-miniapp

# Проверьте что сеть существует
docker network ls | grep remnawave

# Создайте сеть если не существует
docker network create remnawave-network
```

### ERR_SSL_UNRECOGNIZED_NAME_ALERT

- Убедитесь, что SSL сертификат выпущен для правильного домена
- Проверьте пути к сертификатам в Nginx конфигурации
- Перезапустите Nginx: `docker-compose restart nginx`

### Не открывается через Telegram

- Убедитесь, что URL в Bot Menu Button правильный (https!)
- Проверьте что домен доступен извне (не локальный IP)
- Очистите кэш Telegram: Настройки → Данные и память → Очистить кэш

### Telegram Mini App кэшируется

После обновления кода, Telegram может показывать старую версию:

1. **Зайдите в Настройки Telegram** → **Данные и память** → **Использование памяти**
2. Нажмите **Очистить кэш** → выберите все → **Очистить**
3. Или **полностью закройте Telegram** (свайпом вверх) и откройте заново

## Возможности

- ✅ **Управление пользователями**: создание, редактирование, удаление
- ✅ **Статистика**: просмотр общей статистики системы
- ✅ **Управление сквадами**: назначение пользователей в Internal Squads
- ✅ **Управление трафиком**: установка лимитов, сброс счетчика
- ✅ **Управление подписками**: установка срока действия, копирование ссылки
- ✅ **HWID Device Limit**: ограничение количества устройств
- ✅ **Адаптивный дизайн**: работает на всех устройствах
- ✅ **Telegram аутентификация**: безопасный доступ через Telegram

## Безопасность

- ✅ Аутентификация через Telegram WebApp InitData
- ✅ Проверка подписи данных от Telegram
- ✅ Whitelist администраторов по Telegram ID
- ✅ HTTPS обязателен для работы Telegram Mini App
- ✅ API токен Remna Panel хранится в переменных окружения

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Pull requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Поддержка

Если у вас возникли проблемы:

1. Проверьте раздел [Troubleshooting](#troubleshooting)
2. Посмотрите [Issues](https://github.com/marksventsitsky/RemnaPanelMiniApp/issues)
3. Создайте новый Issue с описанием проблемы

---

Made with ❤️ for Remna Panel users
