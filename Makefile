.PHONY: help up down db dev web gen-client migrate test lint

help:
	@grep -E '^[a-zA-Z_-]+:.*?# .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?# "}{printf "  %-12s %s\n", $$1, $$2}'

up:         # Start the full stack in containers (Postgres + API + web)
	docker compose up --build

down:       # Stop and remove containers
	docker compose down

db:         # Start Postgres only (for host-side dev)
	docker compose up -d db

dev:        # Run the API locally with reload (via moon)
	moon run api:dev

web:        # Run the web app locally with reload (via moon)
	moon run web:dev

gen-client: # Regenerate the typed API client from the running API's OpenAPI schema
	moon run web:gen-client

migrate:    # Apply database migrations (via moon)
	moon run api:migrate

test:       # Run the integration test suite (via moon)
	moon run api:test

lint:       # Lint and format-check both apps (via moon)
	moon run api:lint api:format web:lint
