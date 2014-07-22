import sys

# reuse targets from geonode
sys.path.append("../geonode")
from pavement import *

@task
def paste(options):
    # make mapstory.settings resolve
    sys.path.append(".")
    # work for potential paster system install
    from paste.script import command
    command.run('serve --reload paster.ini'.split())

_geonode_static = static
@task
def static(options):
    with pushd('mapstory/static'):
        dest = 'geonode/css'
        os.path.exists(dest) or os.makedirs(dest)
        sh("lessc mapstory/less/base.less > %s/base.css" % dest)
    with pushd('../geonode'):
        _geonode_static(options)
