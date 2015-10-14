[![inventid logo](https://cdn.inventid.nl/assets/logo-horizontally-ba8ae38ab1f53863fa4e99b977eaa1c7.png)](http://opensource.inventid.nl)

# Gennie

[![Code Climate](https://codeclimate.com/github/inventid/gennie/badges/gpa.svg)](https://codeclimate.com/github/inventid/gennie)
[![Dependency Status](https://gemnasium.com/inventid/gennie.svg)](https://gemnasium.com/inventid/gennie)
[![Docker Pulls](https://img.shields.io/docker/pulls/inventid/gennie.svg)](https://hub.docker.com/r/inventid/gennie/)
![MIT license](https://img.shields.io/github/license/inventid/gennie.svg)

## What is it?

Gennie is our text-to-pdf generator.
Written in a few lines of Node.js, she is converting all required templates to pretty PDF documents.

Each Gennie instance serves a specific type of PDF layout, as located in the `document` subfolder.

## How to use it?

### Asking Gennie to do things

Just fire a POST request to `/render`, where the body of your request containes the json required for the template.
Gennie will possibly hold you request for a while, depending on how busy she is.
Once she's ready, she will internally render the document and just return a valid PDF to you.

### Give her all she needs

Gennie needs a document template in `document`.
You can map this in with a Docker container, or simply place your content there.
Please ensure the main file should be called `index.html`.
It can include all kinds of javascript or css, just link to it from `index.html`.

## About the project

At [inventid](https://www.inventid.nl) [@joostverdoorn](https://github.com/joostverdoorn) decided that we needed a new platform.
We used to depend on another system, but increasingly we found it triggered errors under higher loads, and it was coupled to strictly with our remaining applications.
Instead of functioning as a separate service it still had to be deployed on each app server.
This hurt our deploy speeds, made operations more difficult, and did solve only a few issues.

Gennie on the other hand is designed to run as the simplest service possible.
By conforming to the simplest possible REST specification, we are able to run html2pdf as a separate service.
Our documents are stored in a separate repository, which has a special `prebuild` branch.
This branch also contains all required bower dependencies, which can therefore be pulled.

### How to suggest improvements?

In case you have some great ideas, you may just [open an issue](https://github.com/inventid/gennie/issues/new).
Be sure to check beforehand whether the same issue does not already exist.

### How can I contribute?

We feel contributions from the community are extremely worthwhile.
If you use Gennie in production and make some modification, please share it back to the community.
You can simply [fork the repository](/inventid/gennie/fork), commit your changes to your code and create a pull request back to this repository.

If there are any issues related to your changes, be sure to reference to those.
Additionally we use the `develop` branch, so create a pull request to that branch and not to `master`.

### Collaborators

- [joostverdoorn](https://github.com/joostverdoorn) (Lead developer of Gennie @ [inventid](https://www.inventid.nl))

