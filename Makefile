.PHONY: help up down build logs clean install test migrate seed

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies for all projects
	@echo "📦 Installing backend dependencies..."
	@cd backend && pnpm install
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && pnpm install
	@echo "📦 Installing mock-webhook-server dependencies..."
	@cd mock-webhook-server && pnpm install
	@echo "✅ All dependencies installed"

up: ## Start all services with Docker Compose
	@echo "🚀 Starting all services..."
	docker compose up -d
	@echo "✅ All services started"
	@echo "📝 Backend: http://localhost:3000"
	@echo "📝 Frontend: http://localhost:3001"
	@echo "📝 Mock Webhook: http://localhost:4000"

down: ## Stop all services
	@echo "🛑 Stopping all services..."
	docker compose down
	@echo "✅ All services stopped"

build: ## Build all Docker images
	@echo "🔨 Building all images..."
	docker compose build
	@echo "✅ All images built"

rebuild: down build up ## Rebuild and restart all services

logs: ## Show logs from all services
	docker compose logs -f

logs-backend: ## Show backend logs only
	docker compose logs -f backend

logs-frontend: ## Show frontend logs only
	docker compose logs -f frontend

logs-db: ## Show database logs only
	docker compose logs -f postgres

clean: ## Remove all containers, volumes and images
	@echo "🧹 Cleaning up..."
	docker compose down -v --rmi all
	@echo "✅ Cleanup complete"

ps: ## Show running containers
	docker compose ps

restart: ## Restart all services
	docker compose restart

restart-backend: ## Restart backend only
	docker compose restart backend

restart-frontend: ## Restart frontend only
	docker compose restart frontend

shell-backend: ## Open shell in backend container
	docker compose exec backend sh

shell-db: ## Open PostgreSQL shell
	docker compose exec postgres psql -U postgres -d credit_db

test: ## Run tests
	@echo "🧪 Running backend tests..."
	@cd backend && pnpm test
	@echo "✅ Tests complete"

dev-backend: ## Run backend locally (without Docker)
	@cd backend && pnpm run start:dev

dev-frontend: ## Run frontend locally (without Docker)
	@cd frontend && pnpm dev --port 3001

# Database commands (to be implemented later)
migrate: ## Run database migrations
	@echo "⚠️  Migration support will be added in next phase"

seed: ## Seed database with sample data
	@echo "⚠️  Seed support will be added in next phase"
