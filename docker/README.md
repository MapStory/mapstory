
MapStory Docker Deployment
================

Local developer build
----------

Run all commands from the repository root.
The dev deployment uses the `master` tagged docker images.

Add the following to your `/etc/hosts` file

```raw
127.0.0.1       docker
::1             docker
```

```sh
git submodule update --init --recursive
make pull
make up
```

Some modifications will require rebuilding the containers. We're working on minimizing this.

```sh
make build
```

To list the containers:

```sh
make ps
```

To view all logs:

```sh
make logs #this tails the logs, as though using -f
```

To view the logs of a container:

```sh
docker-compose logs <container>
docker-compose logs -f <container> #follow the log file
```

To view your interactive debug statements: (use ctrl+p ctrl+q to exit)

```sh
docker attach mapstory_django_1
```

To gain a shell in a container:

```sh
docker-compose exec <container> /bin/sh
```

To do wipeout your deployment (this will wipe existing data):

```sh
make purge
```

To do refresh your deployment (this will wipe existing data, then rebuild and launch):

```sh
make recreate
```

If you are running into a Permission Denied error:

```sh
make init
make up
```
