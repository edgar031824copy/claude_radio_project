.PHONY: dev prod test down logs

dev:
	docker compose up --build

prod:
	docker compose -f docker-compose.prod.yml up --build

test:
	npm test

down:
	docker compose down
	docker compose -f docker-compose.prod.yml down

logs:
	docker compose logs -f

security:
	npm audit

lint:
	npm run lint
