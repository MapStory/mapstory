from fabric.api import abort, cd, env, prefix, run, sudo, shell_env
from fabric.contrib.console import confirm

"""

Example Usage: fab dev collect runserver

The command above will use Fabric to connect to dev environment, collect static files, and run the django server.

"""

env.activate = 'source /home/mapstory/.virtualenvs/mapstory/bin/activate'
env.remote_interrupt = True
env.notify_message = 'No slacking here! New features have been deployed to http://mapstory.beta.boundlessgeo.com so check it out and let us know what you think!'


def __check_config():
    if 'config' not in env:
        abort('You must specify a configuration to use this method')


def dev():

    """

    Specifies the development configuration

    """

    env.user = 'vagrant'
    env.hosts = ['192.168.56.151']
    env.key_filename = '~/.vagrant.d/insecure_private_key'
    env.config = 'local'


def beta():

    """

    Specifies the beta configuration

    """

    env.user = 'ubuntu'
    env.hosts = ['mapstory.beta.boundlessgeo.com']
    env.key_filename = '~/.ssh/mapstory-v2.pem'
    env.config = 'beta'


def map_loom_django_dev():
    """
    Creates symlinks need to develop MapLoom in our Django environment
    """
    sudo('rm -rf /srv/git/mapstory/mapstory-geonode/mapstory/static/maploom/*')
    sudo('ln -s /srv/git/mapstory/MapLoom/build/* /srv/git/mapstory/mapstory-geonode/mapstory/static/maploom/')
    sudo('rm /srv/git/mapstory/mapstory-geonode/mapstory/templates/maps/maploom.html')
    sudo('ln -s /srv/git/mapstory/MapLoom/build/maploom.html /srv/git/mapstory/mapstory-geonode/mapstory/templates/maps/maploom.html')


def update(branch='master'):

    """

    Update repository to specified branch

    TODO: fix this to fetch, checkout, pull

    """

    with cd('/srv/git/mapstory/geonode'):
        sudo('git pull mapstory/geonode {0}'.format(branch), user='mapstory')
    with cd('/srv/git/mapstory/mapstory-geonode'):
        sudo('git reset --hard', user='mapstory')
        sudo('git pull', user='mapstory')


def pip(download=False):

    """

    Reinstall python requirements

    """

    with cd('/srv/git/mapstory/mapstory-geonode'):
        with prefix(env.activate):
            if download:
                sudo('pip install --download install/ --exists-action '
                    'i -r requirements/.txt', user='mapstory')

            sudo('pip install -r requirements.txt', user='mapstory')


def collect():

    """

    Collect static files for geonode and mapstory-geonode

    """

    with prefix(env.activate):
        with cd('/srv/git/mapstory/geonode/geonode/static'):
            run('npm install')
            run('bower install --noinput')
            sudo('grunt copy', user='mapstory')

        with cd('/srv/git/mapstory/mapstory-geonode/mapstory/static'):
            run('npm install')
            run('bower install --noinput')
            sudo('grunt less', user='mapstory')

        with cd('/srv/git/mapstory/mapstory-geonode'):
            sudo('python manage.py collectstatic --link --noinput --ignore node_modules', user='mapstory')


def runserver():

    """

    Stops Gunicorn and runs django runserver


    """

    __check_config()
    if (env.config != 'local' and
            not confirm('This is designed to only be run locally. Continue?',
                        default=False)):
        abort('Aborting at users request')

    sudo('supervisorctl stop gunicorn-django')

    with cd('/srv/git/mapstory/mapstory-geonode'):
        with prefix(env.activate):
            sudo('python manage.py runserver', user='www-data')

    sudo('supervisorctl start gunicorn-django')



def restart():

    """

    Restart Nginx, Geoserver, and Gunicorn on system

    """

    sudo('supervisorctl restart gunicorn-django')
    sudo('service nginx restart')
    sudo('service tomcat7 restart')
    sudo('supervisorctl restart mapstory-celery')


def notify(channel='#general', username='webhookbot',
           message=env.notify_message, icon=':ship:',
           end_point='https://hooks.slack.com/services/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'):

    """

    Notify others via a slackchat message

    """

    payload = 'payload={"channel": "%s", "username": "%s", "text": "%s", "icon_emoji": "%s"}'% (channel, username,
                                                                                               message, icon)
    curl = "curl -X POST --data-urlencode '{0}' {1}".format(payload, end_point)

    run(curl)


def syncdb():

    """

    Synchronize the database models

    """

    with cd('/srv/git/mapstory/mapstory-geonode'):
        with prefix(env.activate):
            sudo('python manage.py syncdb --noinput --no-initial-data', user='mapstory')

def updateapp(app):

    """

    Clear the database models for a given project, load 

    """

    with cd('/srv/git/mapstory/mapstory-geonode'):
        with prefix(env.activate):
            sudo('python manage.py sqlclear {0} | psql'.format(app), user='mapstory')
            sudo('python manage.py syncdb'.format(app), user='mapstory') 
            sudo('supervisorctl restart gunicorn-django')
            
def clearappdb(app):

    """

    Clear the database models for a given project

    """

    with cd('/srv/git/mapstory/mapstory-geonode'):
        with prefix(env.activate):
            sudo('python manage.py sqlclear {0} | psql'.format(app), user='mapstory')            


def tail(logfile='gunicorn-django', count=30):

    """

    Tail the app log file

    """

    run('tail -n {0} -f /var/log/{1}.log'.format(count, logfile))

def test():

    """

    Synchronize the database models

    """

    with cd('/srv/git/mapstory/mapstory-geonode'):
        with prefix(env.activate):
            sudo('python manage.py test mapstory.tests --settings=mapstory.settings.test_settings', user='mapstory')



