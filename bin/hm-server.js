#!/usr/bin/env node

var util = require('util'),
    nowjs = require("now"),
    sys   = require('sys'),
    server = require('../lib/server-wrapper');

var registeredServices = [];
var location,searchText;

server
    .configure()
      .publicDir(__dirname + '/../public')
      .indexFile('index.html')
      .port(3000)
    .observe('server:configure', function(config, expressServer, serverInstance) {
      var everyone = nowjs.initialize(expressServer);
      var registeredServices = [];

      everyone.now.register = function(key,keyword,data,callback) {

        location = data;
        searchText = keyword;
        console.log('Registering callback on ' + key);
        registeredServices[key] = callback;

        // Transfer existing content
        callback(config.app.socialStream.storage.all());
      };

      setInterval(function() {
        //console.log(' Retrieving social streams ' + location);
        config.app.socialStream.all(searchText,location,function(items) {
          for (var key in registeredServices) {
            registeredServices[key](items);
          }
        });
        console.log('Social streams distributed to ' + registeredServices.length);
      }, 5000);
});


server.start();
