#!/bin/bash
set -e

DOCKER_ENGINE_VERSION=17.05.0~ce-0~debian-jessie
DOCKER_COMPOSE_VERSION=1.13.0

# Setup repo
sudo apt-get update
sudo apt-get install -y --no-install-recommends \
     apt-transport-https \
     ca-certificates \
     curl \
     software-properties-common
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
sudo add-apt-repository \
     "deb [arch=amd64] https://download.docker.com/linux/debian \
     $(lsb_release -cs) \
     edge"
sudo apt-get update

# Install docker-engine
sudo apt-get -y install docker-ce=$DOCKER_ENGINE_VERSION
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo curl -L https://raw.githubusercontent.com/docker/compose/$(docker-compose version --short)/contrib/completion/bash/docker-compose -o /etc/bash_completion.d/docker-compose
alias dco="docker-compose"
echo 'alias dco="docker-compose"' >> ~/.bashrc

# Test Docker
sudo su -l $USER -c "docker run hello-world"

# Install REX-Ray
sudo apt-get install -y --no-install-recommends \
    nfs-client
curl -sSL https://dl.bintray.com/emccode/rexray/install | sh -s -- stable 0.9.1
docker plugin install --grant-all-permissions store/rexray/efs:0.8.2
