
MapStory
================

[![Coverage Status](https://coveralls.io/repos/github/MapStory/mapstory/badge.svg?branch=master)](https://coveralls.io/github/MapStory/mapstory?branch=master) [![Build Status](https://travis-ci.org/MapStory/mapstory.svg?branch=master)](https://travis-ci.org/MapStory/mapstory) [![Waffle.io - Issues in progress](https://badge.waffle.io/MapStory/mapstory.png?label=in%20progress&title=In%20Progress)](https://waffle.io/MapStory/mapstory?utm_source=badge) [![Build Status](https://saucelabs.com/buildstatus/zunware)](https://saucelabs.com/beta/builds/a90681af072a474083478115f31567b0)

[![Build Status](https://saucelabs.com/browser-matrix/zunware.svg)](https://saucelabs.com/beta/builds/a90681af072a474083478115f31567b0)

MapStory.org is the free atlas of change that everyone can edit. We are a community, not a company, working to organize humanity’s shared knowledge about how the world evolves geographically over time, and to make this knowledge easily accessible as an open educational resource.

The MapStory community’s work breaks down into 3 big tasks. We call them the “3 Cs”. First, once you’ve created a profile, you can _collect_ spatio-temporal data and import it. We call each dataset imported into MapStory.org a “StoryLayer”. Second you can _compose_ MapStories that provide nuanced understanding of historical change by combining StoryLayers and other narrative elements, like images, text, or video. Finally, you can _curate_ the accuracy and quality of content presented in MapStory.org by adding ratings, checking metadata, making comments and committing version edits to the actual StoryLayers themselves, much like you might edit a Wikipedia page.


## Getting Started


### Prerequisites

This guide assumes you are using a UNIX based operating system such as Linux or OSX and have the below installed.

```
git
docker
docker-compose
```
### Setup a Development Environment

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.  Start by forking the mapstory repository to your own Github account, and then cloning that repository to your local development environment.

```
git clone https://www.github.com/<your-username>/mapstory
```

Add the following to your `/etc/hosts` file
```
127.0.0.1       docker
::1             docker
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
* [AngularJS 1.6](https://angularjs.org/) - The front end web development framework.

## Contributing

Please read [How to Contribute](https://github.com/MapStory/mapstory/wiki/How-to-Contribute) for details on our code of conduct, and the process for submitting pull requests to us.


## Styleguides & Best Practices
Please review our [Contributor Guides](https://github.com/MapStory/mapstory/wiki#contributor-guides) for best practices and style guides before contributing to the project.
