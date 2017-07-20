Install grunt if you don't have it
npm install -g grunt-cli

Create your package.json file
npm init

Add grunt to the project
npm install grunt --save-dev

Add grunt-screeps to the project
npm install grunt-screeps --save-dev

Create and edit your Gruntfile.js with your screeps credentials
mv Gruntfile.js.dist Gruntfile.js

Commit code from dist folder to screeps using
grunt screeps

Use https://github.com/Garethp/ScreepsAutocomplete for autocomplete
