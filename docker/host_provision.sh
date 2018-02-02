#!/bin/bash
set -e

DOCKER_ENGINE_VERSION=18.01.0~ce-0~debian-jessie
DOCKER_COMPOSE_VERSION=1.18.0
REXRAY_VERSION=0.11.1

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
sudo rm -f /usr/local/bin/docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo rm -f /etc/bash_completion.d/docker-compose
sudo curl -L https://raw.githubusercontent.com/docker/compose/$(docker-compose version --short)/contrib/completion/bash/docker-compose -o /etc/bash_completion.d/docker-compose
alias dco="docker-compose"
echo 'alias dco="docker-compose"' >> ~/.bashrc

# Test Docker
sudo su -l $USER -c "docker run hello-world"

# Install REX-Ray
if [ ! "$USER" == "vagrant" ]; then
    # Skip if being used in a dev environment
    sudo apt-get install -y --no-install-recommends \
        nfs-client
    curl -sSL https://dl.bintray.com/emccode/rexray/install | sh -s -- stable $REXRAY_VERSION
    sudo docker plugin install --grant-all-permissions rexray/efs:$REXRAY_VERSION
fi
