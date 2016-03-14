
mapstory-geonode
================

This is the main codebase for the MapStory application layer. It depends on some forks of other dependent projects.

Repositories
------------

The full build lives in a 'meta-project' at https://github.com/MapStory/mapstory/tree/master. This is used for stability as the upstream dependent projects are pegged to specific versions. While MapStory has forks of upstream projects, the goal is to support temporary efforts that are intended for eventual merging into the respective projects. The forks will be updated as needed.

Deployment
----------

## local developer build

*nb - you may wish to fork the repositories you will be working on and use the fork instead of the master.*

clone the following repositories as siblings (i.e. with these exact names under the same local directory) of each other:
* https://github.com/MapStory/MapLoom
* https://github.com/GeoNode/geonode
* https://github.com/MapStory/geoserver-geonode-ext
* https://github.com/MapStory/mapstory-geonode

* https://github.com/ischneider/geotools (optional - only needed for extended datetime support)

**_check this last one - what is the status of this and what does it mean in practice?_**

a manual build process is described in [manual_setup.md](manual_setup.md)

an automated virtual machine provisioning process using vagrant is documented in [scripts/provision/README.md](scripts/provision/README.md)

## Rebooting!

Currently Mapstory does not recover gracefully from a system reboot.  See [scripts/provision/README.md](scripts/provision/README.md#reboot)

## Production deployment: 
**Todo**
