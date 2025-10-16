#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Настройка окружения для разработки ===${NC}\n"

# Проверка Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 не установлен!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python $(python3 --version) найден${NC}"

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js не установлен!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) найден${NC}"
echo -e "${GREEN}✓ npm $(npm --version) найден${NC}\n"

# Настройка backend
echo -e "${YELLOW}Настройка backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo "Создание виртуального окружения..."
    python3 -m venv venv
fi

echo "Активация виртуального окружения и установка зависимостей..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend настроен${NC}\n"
else
    echo -e "${RED}✗ Ошибка при установке зависимостей backend${NC}"
    exit 1
fi

cd ..

# Настройка frontend
echo -e "${YELLOW}Настройка frontend...${NC}"
cd frontend

echo "Установка зависимостей..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend настроен${NC}\n"
else
    echo -e "${RED}✗ Ошибка при установке зависимостей frontend${NC}"
    exit 1
fi

cd ..

# Проверка .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}Создание .env файла...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Файл .env создан${NC}"
    echo -e "${YELLOW}⚠ Отредактируйте .env и укажите ваши настройки!${NC}\n"
fi

echo -e "${GREEN}=== Настройка завершена! ===${NC}\n"
echo -e "Для запуска backend:"
echo -e "  ${YELLOW}cd backend${NC}"
echo -e "  ${YELLOW}source venv/bin/activate${NC}"
echo -e "  ${YELLOW}uvicorn app.main:app --reload${NC}\n"

echo -e "Для запуска frontend:"
echo -e "  ${YELLOW}cd frontend${NC}"
echo -e "  ${YELLOW}npm run dev${NC}\n"

echo -e "Или используйте: ${YELLOW}make dev${NC}"

