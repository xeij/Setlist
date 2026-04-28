.PHONY: install test local deploy

install:
	pip install -r requirements-dev.txt

test:
	pytest tests/ -v

local:
	uvicorn main:app --reload --port 8000

sam-local:
	sam local start-api --env-vars env.json

deploy:
	sam build && sam deploy --guided
