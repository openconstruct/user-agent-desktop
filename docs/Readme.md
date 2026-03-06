[![Build Status](https://github.com/openconstruct/Umbra/workflows/Build%20Umbra%20Browser/badge.svg)](https://github.com/openconstruct/Umbra/actions)



This is a fork of fern.js, the ghostery browser build system. It has been updated, upgraded, and modified to build Umbra Browser.

 Linux builds of Umbra are built by github and are totally reproducible. Umbra releases are not in this repo but rather in https://github.com/openconstruct/umbra/releases.

 Usage:

 Edit .workspace to set firefox version, app version, and addon settings.

     ./fern.js use
     ./fern.js reset
     ./fern.js import-patches
     cd mozilla-release
     ./mach bootstrap
     MOZCONFIG=/youruseragentdirectory/brands/Umbra/mozconfig /usr/bin/python3.12 ./mach build
     MOZCONFIG=/youruseragentdirectory/brands/Umbra/mozconfig /usr/bin/python3.12 ./mach package

Then if you like you can run build.sh in /packaging/linux to generate rpm/deb, requires rpmbuild and dpkg-dev

This repo is very open for PRs
     
