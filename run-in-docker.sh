#!/bin/bash

echo "Start Xvfb"
Xvfb -ac -screen scrn 1280x2000x24 :9.0 &
export DISPLAY=:9.0

sleep 3

echo "Starting the node server"
/usr/local/bin/pm2 start index.js --no-daemon --instances=1

