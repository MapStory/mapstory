#!/bin/sh
set -e

echo 'Testing permissions...'
touch $MEDIA_ROOT/.ignore
touch $STATIC_ROOT/.ignore
touch $APP_PATH/mapstory/cover/.ignore
rm $MEDIA_ROOT/.ignore
rm $STATIC_ROOT/.ignore
rm $APP_PATH/mapstory/cover/.ignore
echo 'Permissions look good'

cd $APP_PATH/mapstory

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

    if [ "$i" = "--reindex" ]; then
        python manage.py rebuild_index --noinput
    fi

    if [ "$i" = "--test" ]; then
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
        celery -A mapstory worker -B -E -l info --concurrency=$CELERY_NUM_WORKERS
    fi

    if [ "$i" = "--serve" ]; then
        echo 'Running WSGI server'
        python /usr/local/bin/gunicorn \
            --pythonpath=$APP_PATH/mapstory \
            --workers=4 \
            --timeout=120 \
            --bind=0.0.0.0:8000 \
            --log-level=debug \
            --access-logfile=- \
            --error-logfile=- \
            mapstory.wsgi
    fi
done
