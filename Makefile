# TaskFlow Development Commands

.PHONY: help install dev build up down clean logs test

# Default target
help:
	@echo "TaskFlow Development Commands:"
	@echo "  make install    - Install dependencies for all packages"
	@echo "  make dev        - Start development servers"
	@echo "  make build      - Build all packages"
	@echo "  make up         - Start Docker containers"
	@echo "  make down       - Stop Docker containers"
	@echo "  make clean      - Clean Docker containers and volumes"
	@echo "  make logs       - View Docker logs"
	@echo "  make test       - Run tests"

# Install dependencies
install:
	npm install
	cd shared && npm install
	cd client && npm install
	cd server && npm install

# Start development servers
dev:
	npm run dev

# Build all packages
build:
	npm run build

# Docker commands
up:
	docker-compose up -d

down:
	docker-compose down

clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

logs:
	docker-compose logs -f

# Run tests
test:
	npm run test

# Database commands
db-reset:
	docker-compose down postgres
	docker volume rm taskflow_postgres_data
	docker-compose up -d postgres

# Production build
prod-build:
	NODE_ENV=production npm run build