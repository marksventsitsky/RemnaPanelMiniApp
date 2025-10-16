#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Быстрый старт Remna Panel Telegram Bot ===${NC}\n"

# Проверка наличия .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}Файл .env не найден. Создаем из .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Файл .env создан${NC}"
        echo -e "${YELLOW}⚠ Отредактируйте .env и укажите ваши настройки!${NC}\n"
    else
        echo -e "${RED}✗ Файл .env.example не найден!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Файл .env найден${NC}\n"
fi

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker не установлен!${NC}"
    echo "Установите Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose не установлен!${NC}"
    echo "Установите Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker и Docker Compose установлены${NC}\n"

# Запуск
echo -e "${YELLOW}Запускаем приложение...${NC}"
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Приложение успешно запущено!${NC}\n"
    echo -e "Доступные URL:"
    echo -e "  ${GREEN}Frontend:${NC} http://localhost"
    echo -e "  ${GREEN}Backend API:${NC} http://localhost:8000"
    echo -e "  ${GREEN}API Docs:${NC} http://localhost:8000/docs"
    echo -e "\nДля просмотра логов: ${YELLOW}docker-compose logs -f${NC}"
    echo -e "Для остановки: ${YELLOW}docker-compose down${NC}\n"
else
    echo -e "\n${RED}✗ Ошибка при запуске приложения${NC}"
    exit 1
fi

