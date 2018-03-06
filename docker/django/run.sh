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

echo 'Testing permissions...'
touch $MEDIA_ROOT/.ignore_$HOSTNAME
touch $STATIC_ROOT/.ignore_$HOSTNAME
touch $APP_PATH/cover/.ignore_$HOSTNAME
touch /usr/local/lib/python2.7/site-packages-copy/.ignore_$HOSTNAME
rm $MEDIA_ROOT/.ignore_$HOSTNAME
rm $STATIC_ROOT/.ignore_$HOSTNAME
rm $APP_PATH/cover/.ignore_$HOSTNAME
rm /usr/local/lib/python2.7/site-packages-copy/.ignore_$HOSTNAME
echo 'Permissions look good'

# Populate node_modules in story-tools-composer if it's missing
cd $APP_PATH/deps/story-tools-composer
if [ ! -d "./node_modules" ]; then
  cp -r /tmp/story-tools-composer/node_modules ./
fi
# And for composer's story-tools
if [ ! -d "./deps/story-tools/node_modules" ]; then
  cp -r /tmp/story-tools/node_modules ./deps/story-tools/
fi

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


export ALLOWED_HOSTS="$PUBLIC_HOST|$ALLOWED_HOSTS"

for i do # loop over $@

    if [ "$i" = "--init-db" ]; then
        echo 'Initializing database'
        wait_for_pg
        #python manage.py migrate maps --noinput
        #python manage.py migrate journal --noinput
        #python manage.py migrate layers --noinput
        #python manage.py migrate groups --noinput
        echo '    syncdb'
        python manage.py syncdb --noinput
        echo '    migrate'
        python manage.py migrate --noinput
        echo '    load initial data'
        python manage.py loaddata --app mapstory initial_data
        echo '    create admin user'
        python manage.py create_admin_user --name=admin --password=admin
    fi

    if [ "$i" = "--collect-static" ]; then
        echo 'Collecting static files'
        rm -rf $STATIC_ROOT/*
        cd mapstory/static
        npm install
        bower install
        grunt concat
        grunt less:development
        grunt copy:development
        cd ../..
        python manage.py collectstatic --noinput --ignore node_modules

        # composer
        cd deps/story-tools-composer
        #COMPOSER_BUNDLE_ARGS="--output-public-path=$STATIC_ROOT/composer/" ./scripts/run.sh --bundle
        ./scripts/run.sh --bundle
        rm -rf $STATIC_ROOT/composer
        cp -r . $STATIC_ROOT/composer
        cd ../..
    fi

    if [ "$i" = "--collect-static-dev" ]; then
        echo 'Collecting static files for dev deployment'
        rm -rf $STATIC_ROOT/*
        cd mapstory/static
        npm install
        bower install
        grunt concat
        grunt less:development
        grunt copy:development
        cd ../..
        python manage.py collectstatic --link --noinput --ignore node_modules

        # composer
        cd deps/story-tools-composer
        #COMPOSER_BUNDLE_ARGS="--output-public-path=$STATIC_ROOT/composer/" ./scripts/run.sh --bundle-dev
        ./scripts/run.sh --bundle-dev
        rm -rf $STATIC_ROOT/composer
        ln -s `pwd` $STATIC_ROOT/composer
        cd ../..
    fi

    if [ "$i" = "--reindex" ]; then
        echo 'Reindexing'
        wait_for_pg
        python manage.py rebuild_index --noinput
    fi

    if [ "$i" = "--test" ]; then
        echo 'Running tests'
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
        echo 'Running celery workers'
        wait_for_pg
        celery -A mapstory worker -B -E -l info --concurrency=$CELERY_NUM_WORKERS
    fi

    if [ "$i" = "--serve" ]; then
        echo 'Serving...'
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
        echo 'Dev serving...'
        wait_for_pg
        echo 'Copying site-packages' # served by nginx
        rm -rf /usr/local/lib/python2.7/site-packages-copy/*
        cp -r /usr/local/lib/python2.7/site-packages/* /usr/local/lib/python2.7/site-packages-copy/
        echo 'Running dev server'
        python manage.py runserver 0.0.0.0:$DJANGO_PORT
    fi

    if [ "$i" = "--shell" ]; then
        bash
    fi
done
