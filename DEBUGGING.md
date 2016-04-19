Debugging MapStory
------------------

Mapstory is not currently very easy to debug, either as a user or a developer. 

Here are clues - not necessarily the best or only way of dealing with things.

Generally
---------

* you can inspect data in postgres - but if you want to use a convenient tool like pgadmin you need to tweak postgres to listen to external ports for this.
* using _fab dev runserver_ from the provisioning directory _scripts/provision_ allows you to access the python debugger
* you can insert pdb.set_trace() into code (or ipdb) - probably a way to set it up to run python with _-m pdb_ and preset a breakpoint without messing with code.
* with migration to later versions of django .17 and above this may help: https://github.com/django-debug-toolbar/django-debug-toolbar

##Running unit tests
unit tests can be run for a specific module using
fab dev test:tests=mapstory.apps.gazetteer.tests

##Access environment
vagrant ssh
sudo su mapstory
cd /srv/git/mapstory/mapstory-geonode && . /home/mapstory/.virtualenvs/mapstory/bin/activate && python manage.py rebuild_index --noinput

Celery (scheduled tasks)
------------------------

A synchronous mode of operation can be forced by setting:
CELERY_ALWAYS_EAGER in _mapstory/settings/local_settings.py_
** This didnt seem to affect the uploader - which went into a loop trying to get a result after some internal failure

Todo:
* add means or links to do to find running tasks
* how to kill a task thats stuck in a loop (yes - this happens)

Import (Layer Create)
--------------------

The importer does not seem to propagate any error messages from its internals to the user. 


# provided advice:
"set up test fixtures and unit tests and use vagrant" - this means a new VM and layers of software. 

# experiences:
* failure leaves behind a trail of dead things to look at - depending on where things got to before failure:
	* django models in database "mapstory" - tables osgeo_*
    * data uploaded to <layername><seq>	in database "mapstory_data"
	* layers configured in geoserver
	* tasks in celery (need to dive deeper to understand these)
	* ???
	
* there is no obvious way to clean up after a failure.
* end user needs a way to understand and remedy failures - not setting up a unit testing environment
* developers need documentation about the process and post-conditions of the importer functions
* each handler will probably have its own pre- and post-conditions 
* error messages should at the very least say what handler things died in
* handler extension mechanism needs documentation.


