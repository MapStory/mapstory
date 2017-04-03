#!/bin/sh
set -e

echo "$DATABASE_HOST:*:*:$DATABASE_USER:$DATABASE_PASSWORD" > ~/.pgpass
chmod 0600 ~/.pgpass

until psql -h $DATABASE_HOST -U $DATABASE_USER -c '\l' -P pager=off
do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
done

for i do # loop over $@

    if [ "$i" = "--init-db" ]; then
        for f in $SCRIPTS/*.sql
        do
            dbname=`basename ${f%.*}`
            # Create database using the name of the file
            psql -v ON_ERROR_STOP=0 -h $DATABASE_HOST -U $DATABASE_USER -c "CREATE DATABASE $dbname;" || true
            psql -v ON_ERROR_STOP=0 -h $DATABASE_HOST -U $DATABASE_USER -c "GRANT ALL PRIVILEGES ON DATABASE $dbname TO $DATABASE_USER;"
            # Run the contents of the file in the database
            psql -v ON_ERROR_STOP=0 -h $DATABASE_HOST -U $DATABASE_USER -d $dbname -f $f
        done
    fi

    if [ "$i" = "--serve" ]; then
        /docker-entrypoint.sh
    fi
done
