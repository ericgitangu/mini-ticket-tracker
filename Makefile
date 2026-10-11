.PHONY: help up down db migrate api test lint

help:
	@grep -E '^[a-zA-Z_-]+:.*?# .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?# "}{printf "  %-10s %s\n", $$1, $$2}'

up:       # Start Postgres + API in containers
	docker compose up --build

down:     # Stop and remove containers
	docker compose down

db:       # Start Postgres only (for local dev)
	docker compose up -d db

migrate:  # Apply database migrations
	cd api && uv run alembic upgrade head

api:      # Run the API with reload
	cd api && uv run uvicorn app.main:app --reload --port 8000

test:     # Run the integration test suite
	cd api && uv run pytest

lint:     # Lint and format-check
	cd api && uv run ruff check . && uv run ruff format --check .
