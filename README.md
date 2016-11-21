
mapstory-geonode
================

[Clarify: mapstory-geonode relation to mapstory meta-project - why isnt the build in the meta-project? if mapstory-geonode handles all the dependencies why do we need the meta-project at all? ]

Repositories
------------

The full build lives in a 'meta-project' at https://github.com/MapStory/mapstory/tree/master. This is used for stability as the upstream dependent projects are pegged to specific versions. While MapStory has forks of upstream projects, the goal is to support temporary efforts that are intended for eventual merging into the respective projects. The forks will be updated as needed.

Deployment
----------

## local developer build

clone the following repositories as siblings of each other:
* https://github.com/MapStory/MapLoom
* https://github.com/GeoNode/geonode
* https://github.com/MapStory/geoserver-geonode-ext
* https://github.com/MapStory/mapstory-geonode

**This is incompatible with the vagrantfile - which is configured to assume a clone of the *mapstory* meta-project.**

**If one was to work on a module - and fork it - then how do you work with the fork in the context of the vagrant approach?**

* https://github.com/ischneider/geotools (optional - only needed for extended datetime support)

**_check this last one - what is the status of this and what does it mean in practice?_**

a manual build process is described in [manual_setup.md](manual_setup.md)

an automated virtual machine provisioning process using vagrant is documented in [scripts/provision/README.md](scripts/provision/README.md)

## Production deployment: 
**Todo**

## End-to-end tests

Instructions for running end-to-end tests for mapstory.

#### 1: Install testing tools

The following needs to be installed on your system for tests:

- `protractor`
- `webdriver-manager`

**1.1** Go to http://protractor.org and follow the install instructions.

**1.2** Run this to get latest webdriver for your browser:
`webdriver-manager update`

*Optional config*

**1.3** To set the browser used for tests modify this line inside:
 `tests/js/conf.js`

`browserName: 'chrome'` or `browserName: 'firefox'`

#### 2: Start the server

Start the mapstory server with `vagrant up` or `vagrant reload` 

#### 3: Start the webdriver

On another shell `cd` into `mapstory/tests` and run the script 
`./startWebDriver.sh`. Leave this running 

#### 4: Run the tests with protractor

On another shell `cd` into `mapstory/tests` and run the script `./runE2ETests.s`

## Unit tests

1. Start the vagrant machine with `vagrant reload` or `vagrant up` . 
2. Start the vagrant shell with `vagrant ssh`

```bash
# Go to the working directory
cd /srv/git/mapstory/mapstory-geonode/
# Change users
sudo su mapstory
workon mapstory
# Run tests
python manage.py test mapstory.tests
# Run box tests
python manage.py test mapstory.apps.boxes.tests
```
