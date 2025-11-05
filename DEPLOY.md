# 🚀 Развертывание на сервере за 5 минут

## Шаг 1: Подготовка на сервере

```bash
# Создайте папку для Mini App
mkdir -p /opt/remnawave/RemnaPanelMiniApp
cd /opt/remnawave/RemnaPanelMiniApp

# Скачайте файлы
wget https://raw.githubusercontent.com/marksventsitsky/RemnaPanelMiniApp/master/docker-compose.prod.yml -O docker-compose.yml
wget https://raw.githubusercontent.com/marksventsitsky/RemnaPanelMiniApp/master/.env.example -O .env
wget https://raw.githubusercontent.com/marksventsitsky/RemnaPanelMiniApp/master/nginx-miniapp.conf
```

## Шаг 2: Настройка .env

```bash
nano .env
```

Заполните:
```env
REMNA_PANEL_URL=https://panel.example.com
REMNA_API_TOKEN=ваш_api_токен_из_remna
TELEGRAM_BOT_TOKEN=токен_от_BotFather
ADMIN_TELEGRAM_IDS=ваш_telegram_id
SECRET_KEY=$(openssl rand -hex 32)
ENVIRONMENT=production
```

## Шаг 3: Запуск контейнера

```bash
# Создать сеть (если не существует)
docker network create remnawave-network

# Запустить Mini App
docker-compose up -d
```

Проверка:
```bash
docker-compose logs -f
```

## Шаг 4: Настройка Nginx

```bash
# Скопируйте конфиг в Nginx
cp nginx-miniapp.conf /opt/remnawave/nginx/conf.d/miniapp.conf

# Отредактируйте домен
nano /opt/remnawave/nginx/conf.d/miniapp.conf
# Замените miniapp.example.com на ваш домен

# Перезапустите Nginx
docker-compose -f /opt/remnawave/docker-compose.yml restart nginx
```

## Шаг 5: SSL сертификат

```bash
# Получить сертификат
acme.sh --issue -d miniapp.example.com --webroot /var/www/html

# Установить в Nginx контейнер
docker cp ~/.acme.sh/miniapp.example.com_ecc/fullchain.cer remnawave-nginx:/etc/nginx/ssl/miniapp_fullchain.pem
docker cp ~/.acme.sh/miniapp.example.com_ecc/miniapp.example.com.key remnawave-nginx:/etc/nginx/ssl/miniapp_privkey.key

# Перезапустить Nginx
docker-compose -f /opt/remnawave/docker-compose.yml restart nginx
```

## Шаг 6: Настройка Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/mybots` → выберите бота
3. `Bot Settings` → `Menu Button`
4. `Edit Menu Button URL` → `https://miniapp.example.com`
5. `Edit Menu Button Text` → `Открыть панель`

## ✅ Готово!

Откройте бота в Telegram → нажмите кнопку меню → ваша панель откроется!

---

## Обновление

```bash
cd /opt/remnawave/RemnaPanelMiniApp
docker-compose pull
docker-compose up -d
```

## Логи

```bash
docker-compose logs -f
```

## Перезапуск

```bash
docker-compose restart
```

---

## Структура файлов на сервере

```
/opt/remnawave/RemnaPanelMiniApp/
├── docker-compose.yml       # ← Просто этот файл
├── .env                      # ← И этот с настройками
└── nginx-miniapp.conf        # ← Конфиг для копирования в Nginx
```

**Всё!** 3 файла и готово! 🎉

