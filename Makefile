SHELL := /bin/bash
PYTHON ?= python3

BACKEND_DIR := backend
FRONTEND_DIR := frontend
VENV_DIR := $(BACKEND_DIR)/.venv
VENV_BIN := $(VENV_DIR)/bin

.PHONY: setup backend-install backend-lint backend-test backend-run frontend-install frontend-lint frontend-build migrate revision ci clean

setup: backend-install frontend-install

backend-install:
	$(PYTHON) -m venv $(VENV_DIR)
	$(VENV_BIN)/pip install --upgrade pip
	$(VENV_BIN)/pip install -r $(BACKEND_DIR)/requirements.txt

backend-lint:
	$(VENV_BIN)/ruff check $(BACKEND_DIR)

backend-test:
	PYTHONPATH=$(BACKEND_DIR) $(VENV_BIN)/pytest $(BACKEND_DIR)/tests

backend-run:
	$(VENV_BIN)/uvicorn app.main:app --app-dir $(BACKEND_DIR) --reload

migrate:
	cd $(BACKEND_DIR) && ../$(VENV_BIN)/alembic -c alembic.ini upgrade head

revision:
	cd $(BACKEND_DIR) && ../$(VENV_BIN)/alembic -c alembic.ini revision -m "$(m)"

frontend-install:
	cd $(FRONTEND_DIR) && npm install

frontend-lint:
	cd $(FRONTEND_DIR) && npm run lint

frontend-build:
	cd $(FRONTEND_DIR) && npm run build

ci: backend-lint backend-test frontend-lint frontend-build

clean:
	rm -rf $(VENV_DIR)
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist
