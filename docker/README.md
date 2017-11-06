
MapStory Docker Deployment
================


Local developer build
----------

Run all commands from the repository root.
The dev deployment uses the `master` tagged docker images.

Add the following to your `/etc/hosts` file
```
127.0.0.1       docker
::1             docker
```


```
git submodule update --init --recursive
docker-compose pull
docker-compose up -d
```

Some modifications will require rebuilding the containers. We're working on minimizing this.
```
docker-compose pull
docker-compose build --pull
```

To list the containers:
```
docker-compose ps
```

To view the logs of a container:
```
docker-compose logs <container>
docker-compose logs -f <container> #follow the log file
```

To view your interactive debug statements: (use ctrl+p ctrl+q to exit)
```
docker attach mapstory_django_1
```

To gain a shell in a container:
```
docker-compose exec <container> /bin/sh
```

To do refresh your deployment (this will wipe existing data):
```
docker-compose kill
docker-compose rm -f
docker volume ls -q | grep mapstory_ | xargs docker volume rm
docker network prune -f
docker-compose up django_volumes
docker-compose up -d
```

If you are running into a Permission Denied error:
```
docker-compose up django_volumes
docker-compose up -d
```
