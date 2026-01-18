.PHONY: build push push-version push-all deploy help

# Docker Hub username  
DOCKER_USER ?= markrk
IMAGE_NAME = remna-miniapp
VERSION = 2.1.0
TAG ?= latest

help: ## Показать эту справку
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Собрать Docker образ
	docker build -t $(DOCKER_USER)/$(IMAGE_NAME):$(TAG) .
	@echo "✅ Образ собран: $(DOCKER_USER)/$(IMAGE_NAME):$(TAG)"

build-version: ## Собрать Docker образ с версией
	docker build -t $(DOCKER_USER)/$(IMAGE_NAME):$(VERSION) .
	@echo "✅ Образ собран: $(DOCKER_USER)/$(IMAGE_NAME):$(VERSION)"

push: build ## Собрать и опубликовать образ в Docker Hub (latest)
	docker push $(DOCKER_USER)/$(IMAGE_NAME):$(TAG)
	@echo "✅ Образ опубликован: $(DOCKER_USER)/$(IMAGE_NAME):$(TAG)"
	@echo "🚀 Теперь на сервере можно запустить: docker-compose -f docker-compose.prod.yml up -d"

push-version: build-version ## Собрать и опубликовать образ с версией
	docker push $(DOCKER_USER)/$(IMAGE_NAME):$(VERSION)
	@echo "✅ Образ опубликован: $(DOCKER_USER)/$(IMAGE_NAME):$(VERSION)"

push-all: build-version build ## Собрать и опубликовать все версии (version + latest)
	docker push $(DOCKER_USER)/$(IMAGE_NAME):$(VERSION)
	docker tag $(DOCKER_USER)/$(IMAGE_NAME):$(VERSION) $(DOCKER_USER)/$(IMAGE_NAME):latest
	docker push $(DOCKER_USER)/$(IMAGE_NAME):latest
	@echo "✅ Образы опубликованы:"
	@echo "   - $(DOCKER_USER)/$(IMAGE_NAME):$(VERSION)"
	@echo "   - $(DOCKER_USER)/$(IMAGE_NAME):latest"
	@echo "🚀 Теперь на сервере можно запустить: docker-compose -f docker-compose.prod.yml up -d"

login: ## Войти в Docker Hub
	docker login

tag-latest: ## Добавить тег latest к существующему образу
	docker tag $(DOCKER_USER)/$(IMAGE_NAME):$(VERSION) $(DOCKER_USER)/$(IMAGE_NAME):latest
	docker push $(DOCKER_USER)/$(IMAGE_NAME):latest
	@echo "✅ Тег latest добавлен к версии $(VERSION)"

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

