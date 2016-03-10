
Provisioning
============

Mostly this assumes a deployment for the purposes of development to a VirtualBox ubuntu/trusty (14.04) environment.

Provisioning uses a complex stack of automation tools including:
* Vagrant
* Ansible
* apt-get
* Paver
* NPM
* (+ others to build GDAL etc)

the full horror should be hidden - but if something goes wrong please check here for clues - and update this on the assumption that the reader may not be a guru at any given technology in this stack.

*break out AWS and other environments to separate files?*

Prerequisites
-------------

GIT source code checkout - see [../../README.md]([../../README.md])
Vagrant (https://www.vagrantup.com/) 
VirtualBox 
ansible (linux host)
vagrant-guest_ansible (windows host)

Ansible is used to provision MapStory. It can be run from either the command machine or on the guest vm. Ansible is not supported on Windows - so the ansible guest mode is used for this - which requires installing ansible on the guest.
**Can this be done automatically by vagrant? ** 
At the time of writing the inbuilt ansible local provision is borked and cannot be used. [https://github.com/mitchellh/vagrant/issues/6740](https://github.com/mitchellh/vagrant/issues/6740)

NOTE: `vagrant` and `ansible playbook` commands should be run in this directory.

Vagrant based setup
------------------- 

### Setup options

NOTE: As a developer you will probably want to fork the repos you are working on and manually check out the components.

Alternatively if you would like the git repos to be checked out by Ansible, make the following changes:
    
 In Vagrantfile comment out both `config.vm.synced_folder=`
    
 In /host_vars/vagrant.yml set `setup_git_repo: no`

### Basic deployment

#### Windows
1. install VirtualBox 
1. install Vagrant
1. Open a cmd window **as administrator** - if you dont do this the shared folders wont be able to use symlinks and the very last provisioning steps will fail horribly after wasting half your day :-) 
1. `vagrant plugin install vagrant-guest_ansible
1. `vagrant up --no-provision` (this will take a while as it downloads ubuntu` **can this be run in a mode that doesnt provision - to get a chance to install the right version of ansible on the target machine?"
1. vagrant ssh 
1.1 sudo apt-get update
1.1 sudo apt-get install software-properties-common
1.1 sudo apt-add-repository ppa:ansible/ansible
1.1 sudo apt-get install ansible
1.1 ansible --version 
  - > should be > 2.0.1 
1.1 exit 
1. vagrant provision

nb it is possible to reload the vm with no provisioning - to reset the symlinks support issue - use vagrant up --no-provision after shutting down VM in GUI manager (this seems to avoid VBoxManage.exe: error: Context: "LockMachine(a->session, LockType_Write)"  )

#### linux:
1. install VirtualBox 
1. install Vagrant
1. `vagrant up`

#### troubleshooting:
  ** where are ansible logs created? **

[Geonode debug documentation](https://geonode.readthedocs.org/en/1.2/deploy/debug.html)

Initial tests
-------------

### the whole shebang
Assuming an ip address 192.168.56.151

http://192.168.56.151  --> should go to the MapStory home page. *If not then provisioning failed before the second-last step "collect-static local"*

From here it should be possible to load a story layer...
**todo list main tests**


https://geonode.readthedocs.org/en/1.2/deploy/debug.html

#### Geoserver
http://192.168.56.151:8080/geoserver/web/
login as (admin/geoserver) for default

### vm
this is accessible using
`vagrant ssh`

check that the source code is accessible at /srv/git/mapstory/ (as specified in [Vagrantfile])



### Database
Install deploys a postgres database accessible from the local network (i.e. the guest machine) - this is accessible at the ip address reported by the vagrant setup, on the standard port (5432) using postgres/foobar
**todo - add link to security configuration section when available**


  
Operations
----------  
Once complete, the instance should be available at the ip address (e.g. 192.168.56.151)

http://192.168.56.151
http://192.168.56.151:8080  -> tomcat should be running here



If shell access is needed, use:

    vagrant ssh


Update 
------

Updates to HTML and JS should propagate directly from the git controlled working copies to the running application. Browser refresh may be necessary.

### specific update scenarios
- specific update scenarios will be documented here where additional steps are necessary.

Existing documentation on this:
To update (**todo - define what content and dev Use Cases need these steps**)  use the following:

(in Windows first use vagrant ssh -we will be running on guest machine)

    ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i inventory.ini --private-key=~/.vagrant.d/insecure_private_key -u vagrant -t update main.yml

The `update` 'tag' is intended to cover routine updates. There are times when things require some manual intervention. See below.

Paver provides a short cut to this functionality - `paver deploy_dev`. This will, by default, run the 'update' tag but tags can be specified with the `-t` option.


Manual Intervention
-------------------

The most common situation is related to model changes and syncdb. After provisioning, it is recommended to check the output of:

    python manage.py sqldiff -a

This will output SQL statements that would be executed to update the existing DB schema to what is needed. If there are changes that are non-destructive, they can be applied like:

    python manage.py sqldiff -a | python manage.py dbshell

The above will prompt for the password to the database.

Install/Provisioning Intervention/Unit testing
______________________________________________

**Ideally it should be possible to perform idempotent installs of individual modules.  More work is needed here on refactoring and documenting incremental updates and the process of testing and adding steps to the provisioning process**

### Running specific tasks

**todo - is there a way of running from a specific failure point?**

Ansible can be controlled with tags: see the Update section below,

**todo - can this be run from the control machine**

tags are:

**todo - check these are useful idempotent operations and document what they do**

* config
* setup
* update
* elasticsearch
* settings
* initial_data
* superuser
* syncdb
* git
* install
* config
* user
* files
* db
* gunicorn
* nginx
* rabbitmq
* packages
* geoserver


AWS Instance
--------------------

**Pre-flight Check:**

Some useful commands for a pre-flight check are below:

The "--check" flag can be used for a "Dry Run" of the task execution. The following command will show which tasks will
so the status of each task as a result of the execution without actually making the changes.

    ansible-playbook -i inventory-prod.ini --private-key=~/.ssh/aws.pem -t nginx webservers.yml --check --ask-vault-pass


List the hosts that will be affected. Using the "--list-hosts" flag will show which server host will be modified.
    
    ansible-playbook -i inventory-prod.ini --private-key=~/.ssh/aws.pem webservers.yml --list-hosts --ask-vault-pass

**Under The Hood**

The dev (and other deploy target) variables are protected with Ansible vault. If you do not speficy the `--ask-vault-pass` option, a `.vaultpass` file is needed in **this** (where this README is) directory in order to run these commands.

The vaultpass is a secret and is not provided.

An account with sudo access on the target machine is also needed and a credential prompt will appear.

To provision the aws machine, use the following:

    ansible-playbook -i inventory-dev.ini --ask-sudo-pass --vault-password-file=.vaultpass main.yml

As with any playbook, one can specify the tags to execute with the `-t` option, for example `-t update`.


