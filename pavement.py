import sys

# reuse targets from geonode
sys.path.append("../geonode")
from pavement import *


@cmdopts([
    ('bind=', 'b', 'Bind server to provided IP address and port number.')
])
@task
def start_django():
    """
    Start the GeoNode Django application
    """
    bind = options.get('bind', '127.0.0.1')
    # make mapstory.settings resolve
    sys.path.append(".")
    # work for potential paster system install
    from paste.script import command
    cmd = 'serve --reload paster.ini host=%s' % bind
    command.run(cmd.split())


_geonode_static = static
@task
def static(options):
    with pushd('mapstory/static'):
        dest = 'geonode/css'
        os.path.exists(dest) or os.makedirs(dest)
        sh("lessc mapstory/less/base.less > %s/base.css" % dest)
    with pushd('../geonode'):
        _geonode_static(options)

@task
def watch(options):
    sh('grunt watchall', cwd='mapstory/static')
