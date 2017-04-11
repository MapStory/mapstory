#!/bin/sh
set -e

echo Testing permissions...
touch $MEDIA_ROOT/.ignore
touch $STATIC_ROOT/.ignore
touch $APP_PATH/mapstory/cover/.ignore
rm $MEDIA_ROOT/.ignore
rm $STATIC_ROOT/.ignore
rm $APP_PATH/mapstory/cover/.ignore
echo Permissions look good

cd $APP_PATH/mapstory

# Load social auth settings
if [ -e /run/secrets/social_auth ]; then
    set -a
    . /run/secrets/social_auth
    set +a
fi

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
        coverage run ./manage.py test
        coverage report
        coverage html -d cover
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
