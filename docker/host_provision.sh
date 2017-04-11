#!/bin/bash
set -e

DOCKER_ENGINE_VERSION=17.03.0~ce-0~debian-jessie
DOCKER_COMPOSE_VERSION=1.11.2

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
     stable"
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

# Test
sudo su -l $USER -c "docker run hello-world"
