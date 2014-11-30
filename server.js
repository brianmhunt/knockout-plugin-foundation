#!/usr/bin/env node

// Just a simple server. See eg 
// http://stackoverflow.com/questions/6084360/using-node-js-as-a-simple-web-server

var port = 8080;
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(port);

console.log("Listening on localhost:" + port)