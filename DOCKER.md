# 🐳 Инструкции по работе с Docker образами

## Образы в Docker Hub

Образ публикуется в Docker Hub: `markrk/remna-miniapp`

- **latest** - последняя стабильная версия
- **2.1.0** - конкретная версия (январь 2026)

## Быстрый старт

### Локальная сборка

```bash
# Собрать образ локально
make build

# Или с указанием версии
make build-version
```

### Публикация в Docker Hub

```bash
# 1. Войти в Docker Hub
make login

# 2. Опубликовать версию и latest
make push-all

# Или только latest
make push

# Или только версию
make push-version
```

## Детальные команды

### Сборка образа

```bash
# Собрать образ с тегом latest
docker build -t markrk/remna-miniapp:latest .

# Собрать образ с версией
docker build -t markrk/remna-miniapp:2.1.0 .

# Собрать оба образа
docker build -t markrk/remna-miniapp:2.1.0 .
docker tag markrk/remna-miniapp:2.1.0 markrk/remna-miniapp:latest
```

### Публикация образа

```bash
# Войти в Docker Hub
docker login

# Опубликовать образ
docker push markrk/remna-miniapp:2.1.0
docker push markrk/remna-miniapp:latest
```

### Использование образа

```bash
# На сервере использовать docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Обновление образа после изменений

После обновления кода для публикации нового образа:

```bash
# 1. Убедитесь, что версия обновлена в package.json
#    (текущая версия: 2.1.0)

# 2. Войдите в Docker Hub
make login

# 3. Соберите и опубликуйте новую версию
make push-all

# 4. На сервере обновите образ
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Проверка образа

```bash
# Посмотреть метаданные образа
docker inspect markrk/remna-miniapp:2.1.0

# Посмотреть историю сборки
docker history markrk/remna-miniapp:2.1.0

# Проверить размер образа
docker images markrk/remna-miniapp
```

## Структура Dockerfile

Dockerfile использует multi-stage build:

1. **frontend-build** - сборка фронтенда (React + Vite)
2. **backend-build** - сборка бэкенда (TypeScript + Bun)
3. **production** - финальный образ на базе `oven/bun:1-alpine`

## Переменные окружения

Образ использует следующие переменные окружения:

```env
REMNA_PANEL_URL=https://panel.example.com
REMNA_API_TOKEN=your_api_token
TELEGRAM_BOT_TOKEN=your_bot_token
ADMIN_TELEGRAM_IDS=123456789,987654321
SECRET_KEY=your_secret_key
ENVIRONMENT=production
PORT=8000
```

## Health Check

Образ включает health check:

```bash
# Проверить здоровье контейнера
docker inspect --format='{{.State.Health.Status}}' remna-miniapp
```

## Отладка

```bash
# Запустить контейнер интерактивно
docker run -it --rm \
  --env-file .env \
  -p 8000:8000 \
  markrk/remna-miniapp:2.1.0 \
  /bin/sh

# Посмотреть логи
docker logs -f remna-miniapp

# Проверить процессы
docker exec remna-miniapp ps aux
```

## Версионирование

При обновлении версии:

1. Обновите `version` в `package.json`
2. Обновите `VERSION` в `Makefile`
3. Обновите `LABEL version` в `Dockerfile`
4. Соберите и опубликуйте новый образ

---

**Последнее обновление**: Январь 2026  
**Текущая версия**: 2.1.0  
**Docker Hub**: https://hub.docker.com/r/markrk/remna-miniapp
