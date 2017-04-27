from django.db import connection

def tearDownPackage():
    cursor = connection.cursor()
    cursor.execute("""SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'test_mapstory_geogig'
          AND pid <> pg_backend_pid();""")
    cursor.execute("""SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'test_mapstory_data'
          AND pid <> pg_backend_pid();""")
