dco = $(or ${DCO}, docker-compose)

help:
	@echo "  make up    - start containers"
	@echo "  make down     - stop containers"
	@echo "  make purge    - stop containers and prune volumes"
	@echo "  make recreate - stop containers, prune volumes and recreate/build containers"
	@echo "  make test     - run unit tests"
	@echo "  make lint     - run to lint (style check) repo"

build:
	./scripts/build.sh

init:
	${dco} up django_volumes

down:
	${dco} down --remove-orphans

up: init
	${dco} up -d nginx

restart: down up

purge: down
	docker volume prune -f

recreate: purge build init
	${dco} up -d --force-recreate

logs:
	${dco} logs -f

test:
	${dco} run --rm django --test
	${dco} run --rm composer --test

lint:
	${dco} run --rm composer --lint
	${dco} run --rm django --lint
