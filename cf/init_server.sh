#!/bin/sh
echo "------ Create database tables ------"
python manage.py syncdb --noinput
python manage.py collectstatic --noinput

echo "------ create default admin user ------"
echo "from geonode.people.models import Profile; Profile.objects.create_superuser('admin', 'admin@mapstory.com', 'admin')" | python manage.py shell

echo "------ Running server instance -----"
python manage.py runserver --insecure 0.0.0.0:$PORT
