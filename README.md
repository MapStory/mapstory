mapstory
================

[![Coverage Status](https://coveralls.io/repos/github/MapStory/mapstory/badge.svg?branch=master)](https://coveralls.io/github/MapStory/mapstory?branch=master) [![Build Status](https://travis-ci.org/MapStory/mapstory.svg?branch=master)](https://travis-ci.org/MapStory/mapstory)

MapStory.org is the free atlas of change that everyone can edit. We are a community, not a company, working to organize humanity’s shared knowledge about how the world evolves geographically over time, and to make this knowledge easily accessible as an open educational resource.

The MapStory community’s work breaks down into 3 big tasks. We call them the “3 Cs”. First, once you’ve created a profile, you can _collect_ spatio-temporal data and import it. We call each dataset imported into MapStory.org a “StoryLayer”. Second you can _compose_ MapStories that provide nuanced understanding of historical change by combining StoryLayers and other narrative elements, like images, text, or video. Finally, you can _curate_ the accuracy and quality of content presented in MapStory.org by adding ratings, checking metadata, making comments and committing version edits to the actual StoryLayers themselves, much like you might edit a Wikipedia page.


## Getting Started


### Prerequisites

#### System Requirements

Diskspace: - approx 20Gb of disk space is required for the full software stack and runtime data storage for testing. More may be required depending on data capacity. _TBD: sizing guidelines for production deployments_

Memory: - Geonode recommends 6GB of memory. At least 2GB seems necessary to build the deployment using docker. [http://docs.geonode.org/en/master/tutorials/install_and_admin/quick_install.html#recommended-minimum-system-requirements]

OS: These instructions assume a UNIX environment you can access via HTTP, or a Windows Pro desktop environment with Hyper-V and Docker-CE https://store.docker.com/editions/community/docker-ce-desktop-windows are required.

Instructions for using Vagrant and virtualbox to use a UNIX VM on other host environments are in testing and preparation. Other environments should provide specific instructions in README-<env>.md 

Make sure these components are installed:

```
git
docker
docker-compose
```

#### Networking access requirements

Mapstory creates an appication accessible via HTTP.
_TBD: identify any network access requirements for management procedures such as codebase updates_

##### Unix host with GUI
Add the following to your `/etc/hosts` file
```
127.0.0.1       docker
::1             docker
```

_Todo: does this work if there are multiple docker containers running on the machine?_

##### Windows Pro/Docker
_TBD_

##### Vagrant/virtualbox 
_TBD_

### Setup a Development Environment

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.  Start by forking the mapstory repository to your own Github account, and then cloning that repository to your local development environment.

```
git clone https://www.github.com/<your-username>/mapstory
```


Run the following commands to start up the docker containers.

```
git submodule update --init --recursive
docker-compose pull
docker-compose up -d
```

Your local site should now be available at `http://docker/`.

Additional information about using the docker build is available at our [Docker README](https://github.com/MapStory/mapstory/blob/master/docker/README.md).

## Built With

* [Python 2.7](https://www.python.org/) - The primary backend development language.
* [Django 1.8.7](https://www.djangoproject.com/) - The back end web development framework.
* [AngularJS 1.3](https://angularjs.org/) - The front end web development framework.

## Contributing

Please read [How to Contribute](https://github.com/MapStory/mapstory/wiki/How-to-Contribute) for details on our code of conduct, and the process for submitting pull requests to us.


## Styleguides & Best Practices
Please review our [Contributor Guides](https://github.com/MapStory/mapstory/wiki#contributor-guides) for best practices and style guides before contributing to the project.
