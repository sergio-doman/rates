#!/bin/bash

# Install Rates Enviroment for ubuntu 14.0.4 lte Trusty

# Make sure only root can run our script
if [[ $EUID -ne 0 ]]; then
        echo "This script must be run as root" 1>&2
        exit 1
fi

# Add node.js (v4)
# https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -

add-apt-repository -y ppa:rwky/redis

apt-get update

apt-get install -y python-software-properties
apt-get install -y redis-server
apt-get install -y nodejs
npm install -g bower

echo "Rates enviroment installed, have fun!"