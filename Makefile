SHELL := /bin/bash
PYTHON ?= python3

BACKEND_DIR := backend
FRONTEND_DIR := frontend
VENV_DIR := $(BACKEND_DIR)/.venv
VENV_BIN := $(VENV_DIR)/bin

.DEFAULT_GOAL := help

.PHONY: help setup backend-install backend-lint backend-test backend-run frontend-install frontend-lint frontend-build migrate revision ci clean

help: ## Show available make targets
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*## ' Makefile | sed -E 's/:.*## / - /'

setup: backend-install frontend-install ## Install backend and frontend dependencies

backend-install: ## Create backend virtualenv and install requirements
	$(PYTHON) -m venv $(VENV_DIR)
	$(VENV_BIN)/pip install --upgrade pip
	$(VENV_BIN)/pip install -r $(BACKEND_DIR)/requirements.txt

backend-lint: ## Run backend lint
	$(VENV_BIN)/ruff check $(BACKEND_DIR)

backend-test: ## Run backend tests
	PYTHONPATH=$(BACKEND_DIR) $(VENV_BIN)/pytest $(BACKEND_DIR)/tests

backend-run: ## Run backend dev server
	$(VENV_BIN)/uvicorn app.main:app --app-dir $(BACKEND_DIR) --reload

migrate: ## Run Alembic upgrade head
	cd $(BACKEND_DIR) && ../$(VENV_BIN)/alembic -c alembic.ini upgrade head

revision: ## Create Alembic revision, usage: make revision m="message"
	cd $(BACKEND_DIR) && ../$(VENV_BIN)/alembic -c alembic.ini revision -m "$(m)"

frontend-install: ## Install frontend dependencies
	cd $(FRONTEND_DIR) && npm install

frontend-lint: ## Run frontend lint
	cd $(FRONTEND_DIR) && npm run lint

frontend-build: ## Build frontend
	cd $(FRONTEND_DIR) && npm run build

ci: backend-lint backend-test frontend-lint frontend-build ## Run full CI checks

clean: ## Remove local build artifacts
	rm -rf $(VENV_DIR)
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist
