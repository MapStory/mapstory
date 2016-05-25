import os
import subprocess
import sys

# set this ahead of time as geonode settings will import it's celery app which
# in turn uses setdefault to modify to geonode.settings causing subtle problems
os.environ['DJANGO_SETTINGS_MODULE'] = 'mapstory.settings'

# reuse targets from geonode
sys.path.append("../geonode")
from pavement import *


@cmdopts([
    ('bind=', 'b', 'Bind server to provided IP address and port number.')
])
@task
def start_django():
    """
    Start the GeoNode Django application and run grunt watchall
    """
    bind = options.get('bind', '127.0.0.1')

    grunt = subprocess.Popen(
        ['grunt watchall'],
        cwd = 'mapstory/static',
        shell=True,
        stdout=sys.stdout,
        stderr=sys.stderr,
    )

    try:
        _paste(bind)
        try:
            grunt.wait()
        except KeyboardInterrupt:
            pass
    finally:
        if grunt.poll() is None:
            grunt.kill()


def _paste(bind):
    # paste must installed system wide - seems pip install doesn't put
    # console_scripts in place but we need to run w/ venv python and
    # get it to pickup mapstory settings
    try:
        sh("PYTHONPATH=. python /usr/bin/paster serve --reload paster.ini bind=%s" % bind)
    except KeyboardInterrupt:
        pass

@task
def clean():
    '''remove node and bower installed packages to ensure a clean build'''
    with pushd('scripts/misc'):
        sh('./clean')

@task
@needs('clean')
def geonode_static():
    '''geonode static task not ideal'''
    with pushd('../geonode/geonode/static'):
        sh('npm install')
        sh('bower install')
        sh('grunt copy')


@task
def run_tests():
    sh('python manage.py test mapstory.tests')

@task
@needs('geonode_static')
def static():
    with pushd('mapstory/static'):
        sh('npm install')
        sh('bower install')
        sh('grunt less')
        sh('grunt copy')


@task
@cmdopts([
    ('options=', 'o', 'django collect static options to run')
])
@needs('static')
def collect_static(options):
    opts = options.get('options', '--link --noinput --ignore node_modules')
    cmd = 'python manage.py collectstatic %s' % opts
    sh(cmd)


@cmdopts([
    ('tags=', 't', 'ansible tags to run')
])
@task
def deploy_dev():
    '''deploy to dev'''
    tags = options.get('tags','update')
    cmd = 'ansible-playbook -i inventory-dev.ini --vault-password-file .vaultpass --ask-sudo-pass main.yml -t %s' % tags
    with pushd('scripts/provision'):
        sh(cmd)
