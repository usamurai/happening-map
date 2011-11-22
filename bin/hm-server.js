#!/usr/bin/env node

var util = require('util'),
    nowjs = require("now"),
    server = require('../lib/server-wrapper');

var registeredServices = [];


server
    .configure()
      .publicDir(__dirname + '/../public')
      .indexFile('index.html')
      .port(3000)
    .observe('server:configure', function(config, expressServer, serverInstance) {
      var everyone = nowjs.initialize(expressServer);
      var registeredServices = [];

      everyone.now.register = function(key, callback) {
        console.log('Registering callback on ' + key);
        registeredServices[key] = callback;

        // Transfer existing content
        callback(config.app.socialStream.storage.all());
      };

      setInterval(function() {
        console.log('Retrieving social streams');
        config.app.socialStream.all(function(items) {
          for (var key in registeredServices) {
            registeredServices[key](items);
          }
        });
        console.log('Social streams distributed to ' + registeredServices.length);
      }, 5000);
});


server.start();
