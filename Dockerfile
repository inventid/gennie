FROM node:latest
MAINTAINER Rogier Slag

RUN apt-get update && \
    apt-get install libgtk2.0-0 libgconf-2-4 libasound2 libxtst6 libxss1 libnss3 xvfb -y && \
    apt-get autoremove -y && \
    apt-get clean

RUN npm install -g pm2

RUN mkdir /opt/gennie
RUN mkdir /opt/gennie/document

VOLUME ["/opt/gennie/document"]
EXPOSE 3000

ADD run-in-docker.sh /opt/gennie/start.sh
ADD config.json /opt/gennie/config.json
ADD package.json /opt/gennie/package.json
RUN cd /opt/gennie && npm install

ADD index.js /opt/gennie/index.js

WORKDIR /opt/gennie
CMD ["/bin/bash", "start.sh" ]

