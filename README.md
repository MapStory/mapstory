
mapstory
================

[![Coverage Status](https://coveralls.io/repos/github/MapStory/mapstory/badge.svg?branch=master)](https://coveralls.io/github/MapStory/mapstory?branch=master)

Please visit [our wiki](https://github.com/MapStory/mapstory/wiki)

Interested in seeing our progress?  We're keeping track of what is going on using our [Waffle kanban board](https://waffle.io/MapStory/mapstory).

Deployment
----------


## local developer build

clone the following repositories as siblings of each other:
* https://github.com/MapStory/MapLoom
* https://github.com/GeoNode/geonode
* https://github.com/MapStory/geoserver-geonode-ext
* https://github.com/MapStory/mapstory

**This is incompatible with the vagrantfile - which is configured to assume a clone of the *mapstory* meta-project.**

**If one was to work on a module - and fork it - then how do you work with the fork in the context of the vagrant approach?**

* https://github.com/ischneider/geotools (optional - only needed for extended datetime support)

**_check this last one - what is the status of this and what does it mean in practice?_**

a manual build process is described in [manual_setup.md](manual_setup.md)

an automated virtual machine provisioning process using vagrant is documented in [scripts/provision/README.md](scripts/provision/README.md)

## Production deployment 
**Todo**

## Styleguides & Best Practices
You can find documentation about code styles and best practices on [our wiki](https://github.com/MapStory/mapstory/wiki).
