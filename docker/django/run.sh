#!/bin/sh
set -e

wait_for_pg()
{
    echo 'Waiting for Postgres...'
    while ! curl http://$DATABASE_HOST:$DATABASE_PORT/ 2>&1 | grep '52'
    do
        sleep 1
    done
    echo 'Postgres is up'
}

# Reset permissions on the shared volumes
# The nginx container seems to break these regularly
#chown -R mapstory:mapstory $STATIC_ROOT
#chown -R mapstory:mapstory $MEDIA_ROOT
#chown -R mapstory:mapstory $APP_PATH/cover

echo 'Testing permissions...'
touch $MEDIA_ROOT/.ignore_$HOSTNAME
touch $STATIC_ROOT/.ignore_$HOSTNAME
touch $APP_PATH/cover/.ignore_$HOSTNAME
rm $MEDIA_ROOT/.ignore_$HOSTNAME
rm $STATIC_ROOT/.ignore_$HOSTNAME
rm $APP_PATH/cover/.ignore_$HOSTNAME
echo 'Permissions look good'

cd $APP_PATH

# Load secrets as environment variables
for secret in /run/secrets/env_*; do
    # Pattern matches with no results are treated as string literals.
    # Verify that the file actually exists.
    [ -f "$secret" ] || continue
    set -a
    . $secret
    set +a
done

for i do # loop over $@

    if [ "$i" = "--init-db" ]; then
        wait_for_pg
        python manage.py migrate maps --noinput
        python manage.py migrate journal --noinput
        python manage.py migrate layers --noinput
        python manage.py migrate groups --noinput
        python manage.py migrate --noinput
        python manage.py syncdb --noinput

        python manage.py create_admin_user --name=admin --password=admin
    fi

    if [ "$i" = "--collect-static" ]; then
        rm -rf $STATIC_ROOT/*
        python manage.py collectstatic --noinput --ignore node_modules
    fi

    if [ "$i" = "--collect-static-dev" ]; then
        rm -rf $STATIC_ROOT/*
        python manage.py collectstatic --link --noinput --ignore node_modules
    fi

    if [ "$i" = "--reindex" ]; then
        wait_for_pg
        python manage.py rebuild_index --noinput
    fi

    if [ "$i" = "--test" ]; then
        wait_for_pg
        rm -f cover/*
        CELERY_ALWAYS_EAGER=true CELERY_EAGER_PROPAGATES_EXCEPTIONS=true coverage run ./manage.py test
        coverage report
        coverage html -d cover
        if [ "$TRAVIS" ]; then
            echo "Running coveralls"
            coveralls
        fi
    fi

    if [ "$i" = "--celery" ]; then
        wait_for_pg
        celery -A mapstory worker -B -E -l info --concurrency=$CELERY_NUM_WORKERS
    fi

    if [ "$i" = "--serve" ]; then
        wait_for_pg
        echo 'Running WSGI server'
        python /usr/local/bin/gunicorn \
            --pythonpath=$APP_PATH \
            --workers=4 \
            --timeout=120 \
            --bind=0.0.0.0:$DJANGO_PORT \
            --log-level=debug \
            --access-logfile=- \
            --error-logfile=- \
            mapstory.wsgi
    fi

    if [ "$i" = "--serve-dev" ]; then
        wait_for_pg
        echo 'Copying site-packages'
        rm -rf /usr/local/lib/python2.7/site-packages-copy
        cp -r /usr/local/lib/python2.7/site-packages /usr/local/lib/python2.7/site-packages-copy
        echo 'Running dev server'
        python manage.py runserver 0.0.0.0:$DJANGO_PORT
    fi
done
