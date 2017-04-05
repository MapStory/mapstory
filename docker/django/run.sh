#!/bin/sh
set -e

echo Testing permissions...
touch $MEDIA_ROOT/.ignore
touch $STATIC_ROOT/.ignore
rm $MEDIA_ROOT/.ignore
rm $STATIC_ROOT/.ignore
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
        rm cover/*
        coverage run ./manage.py test
        coverage report
        coverage html -d cover
    fi

    if [ "$i" = "--celery" ]; then
        celery -A mapstory worker -B -E -l info --concurrency=$CELERY_NUM_WORKERS
    fi

    if [ "$i" = "--serve" ]; then
        python manage.py runserver 0.0.0.0:$DJANGO_PORT
    fi
done
