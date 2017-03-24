#!/bin/sh

cd $APP_PATH/mapstory

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
        rm -r $STATIC_ROOT/*
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
#        sleep infinity
    fi

    if [ "$i" = "--celery" ]; then
        celery -A mapstory worker -B -E -l info --concurrency=$CELERY_NUM_WORKERS
    fi

    if [ "$i" = "--serve" ]; then
        python manage.py runserver 0.0.0.0:$DJANGO_PORT
    fi
done
