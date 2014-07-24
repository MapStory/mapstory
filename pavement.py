import os
import subprocess
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
        sh("PYTHONPATH=. python /usr/bin/paster serve paster.ini host=%s" % bind)
    except KeyboardInterrupt:
        pass

