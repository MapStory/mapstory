dco = $(or ${DCO}, docker-compose)

help:
	@echo "  make up       - start containers"
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

pull:
	${dco} pull

ps:
	${dco} ps

restart: down up

purge: down
	docker volume prune -f

recreate: purge build init
	${dco} up -d --force-recreate

refresh_repo: # This is destructive. It will delete any modifications in ./deps and ./mapstory.
	git pull
	rm -r deps mapstory
	git checkout -- mapstory
	git submodule update --init --recursive

refresh_deploy: refresh_repo build down up # This is also destructive.

logs:
	${dco} logs -f

test:
	${dco} run --rm django --test
	${dco} run --rm composer --test

lint:
	${dco} run --rm composer --lint
	${dco} run --rm django --lint
