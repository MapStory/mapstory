DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'mapstory',
        'USER': 'mapstory',
        'PASSWORD': 'mapstory',
        'HOST' : 'localhost',
    },
    'datastore' : {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'mapstory_data',
        'USER' : 'mapstory',
        'PASSWORD' : 'mapstory',
        'HOST' : 'localhost',
        'PORT' : '5432',
    }
}