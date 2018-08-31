#!/bin/sh
set -e

BAK_DIR=/backups

# Parent Dockerfile sets this as a VOLUME.
# We need to set the owndership as root at runtime.
chown -R pgadmin:pgadmin /var/lib/pgadmin

# Load secrets as environment variables
for secret in /run/secrets/env_*; do
    # Pattern matches with no results are treated as string literals.
    # Verify that the file actually exists.
    [ -f "$secret" ] || continue
    set -a
    . $secret
    set +a
done

# Setup Postgres authentication
echo "$DATABASE_HOST:*:*:$DATABASE_USER:$DATABASE_PASSWORD" > ~/.pgpass
chmod 0600 ~/.pgpass

# Wait until Postgres is up
until psql -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER -c '\l' -P pager=off
do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
done

for i do # loop over $@

    # Run init scripts on the DBs
    if [ "$i" = "--init-db" ]; then
        for f in $SCRIPTS/*.sql
        do
            dbname=`basename ${f%.*}`
            # Create database using the name of the file
            psql -v ON_ERROR_STOP=0 -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER -c "CREATE DATABASE $dbname;" || true
            psql -v ON_ERROR_STOP=0 -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER -c "GRANT ALL PRIVILEGES ON DATABASE $dbname TO $DATABASE_USER;"
            # Run the contents of the file in the database
            psql -v ON_ERROR_STOP=0 -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER -d $dbname -f $f
        done
    fi

    # Serve the pgadmin application
    if [ "$i" = "--serve" ]; then
        su-exec pgadmin /usr/local/bin/docker-entrypoint.sh pgadmin4
    fi

    # Dump databases
    if [ "$i" = "--dump" ]; then
        for f in $SCRIPTS/*.sql
        do
            dbname=`basename ${f%.*}`
            pg_dump --host=$DATABASE_HOST --port=$DATABASE_PORT --username=$DATABASE_USER --dbname=$dbname --schema=public --blobs --format=directory --compress=9 --file=$BAK_DIR/$dbname --jobs=4
        done
    fi

    # Restore databases
    if [ "$i" = "--restore" ]; then
        for f in $SCRIPTS/*.sql
        do
            dbname=`basename ${f%.*}`
            pg_restore --host=$DATABASE_HOST --port=$DATABASE_PORT --username=$DATABASE_USER --dbname=$dbname --schema=public --format=directory --file=$BAK_DIR/$dbname --jobs=4
        done
    fi

    # Serve the pgadmin application
    if [ "$i" = "--shell" ]; then
        su-exec pgadmin /bin/sh
    fi
done
