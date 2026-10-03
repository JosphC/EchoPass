.PHONY: up down check test logs reset

up:
	docker compose up --build -d app mock-api

down:
	docker compose down

check:
	docker compose run --rm checks

test:
	docker compose run --rm checks npm test -- --ci --forceExit

logs:
	docker compose logs -f app mock-api

reset:
	docker compose down -v
