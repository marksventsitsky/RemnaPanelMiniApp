.PHONY: build push deploy help

# Docker Hub username  
DOCKER_USER ?= markrk
IMAGE_NAME = remna-miniapp
TAG ?= latest

help: ## Показать эту справку
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Собрать Docker образ
	docker build -t $(DOCKER_USER)/$(IMAGE_NAME):$(TAG) .
	@echo "✅ Образ собран: $(DOCKER_USER)/$(IMAGE_NAME):$(TAG)"

push: build ## Собрать и опубликовать образ в Docker Hub
	docker push $(DOCKER_USER)/$(IMAGE_NAME):$(TAG)
	@echo "✅ Образ опубликован: $(DOCKER_USER)/$(IMAGE_NAME):$(TAG)"
	@echo "🚀 Теперь на сервере можно запустить: docker-compose -f docker-compose.prod.yml up -d"

login: ## Войти в Docker Hub
	docker login

tag-latest: ## Добавить тег latest
	docker tag $(DOCKER_USER)/$(IMAGE_NAME):$(TAG) $(DOCKER_USER)/$(IMAGE_NAME):latest
	docker push $(DOCKER_USER)/$(IMAGE_NAME):latest

local: ## Запустить локально для разработки
	docker-compose up -d
	@echo "✅ Локальный сервер запущен на http://localhost:8000"
	@echo "📋 Логи: docker-compose logs -f"

stop: ## Остановить локальный контейнер
	docker-compose down

logs: ## Показать логи
	docker-compose logs -f

clean: ## Удалить образы и контейнеры
	docker-compose down -v
	docker rmi $(DOCKER_USER)/$(IMAGE_NAME):$(TAG) || true
	@echo "✅ Очищено"

