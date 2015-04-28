Provisioning
============

Ansible is used to provision MapStory.

NOTE: `vagrant` and `ansible playbook` commands should be run in this directory.

Vagrant
-------

To provision a VirtualBox Vagrant instance, use the following command (this will take a while):

    vagrant up

Once complete, the instance should be available at 192.168.56.151

If shell access is needed, use:

    vagrant ssh

To update use the following:

    ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i inventory.ini --private-key=~/.vagrant.d/insecure_private_key -u vagrant -t update main.yml

The `update` 'tag' is intended to cover routine updates. There are times when things require some manual intervention. See below.

Development Instance
--------------------

Paver provides a short cut to this functionality - `paver deploy_dev`. This will, by default, run the 'update' tag but tags can be specified with the `-t` option.

**Under The Hood**

The dev (and other deploy target) variables are protected with Ansible vault. A `.vaultpass` file is needed in **this** (where this README is) directory in order to run these commands.

The vaultpass is a secret and is not provided.

An account with sudo access on the target machine is also needed and a credential prompt will appear.

To provision the development machine, use the following:

    ansible-playbook -i inventory-dev.ini --ask-sudo-pass --vault-password-file=.vaultpass main.yml

As with any playbook, one can specify the tags to execute with the `-t` option, for example `-t update`.

Manual Intervention
-------------------

The most common situation is related to model changes and syncdb. After provisioning, it is recommended to check the output of:

    python manage.py sqldiff -a

This will output SQL statements that would be executed to update the existing DB schema to what is needed. If there are changes that are non-destructive, they can be applied like:

    python manage.py sqldiff -a | python manage.py dbshell

The above will prompt for the password to the database.

Method in the Madness
---------------------

First ansible project. Attempt was made to use Ansible roles but had problems with role dependencies and execution ordering. This could very well be the result of a misunderstanding...

There are a number of Ansible tags available (grep tags *.yml) but most useful is `update`. The others exist as artifacts of hacking through the process.
