(function() {
  var wrapper;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  this.version = [0, 1];
  wrapper = module.exports;
  wrapper.server = require('./happening-map/server');
  wrapper.app = require('./happening-map/app');
  wrapper.util = require('./happening-map/util');
  wrapper.config = {
    host: '0.0.0.0',
    port: 3000,
    indexFile: "index.html",
    publicDir: null,
    observers: []
  };
  wrapper.status = {
    instance: null,
    started: false
  };
  wrapper.configure = function() {
    this.publicDir = __bind(function(dir) {
      wrapper.config.publicDir = dir;
      return this;
    }, this);
    this.indexFile = __bind(function(file) {
      wrapper.config.indexFile = file;
      return this;
    }, this);
    this.host = __bind(function(host) {
      wrapper.config.host = host;
      return this;
    }, this);
    this.port = __bind(function(port) {
      wrapper.config.port = port;
      return this;
    }, this);
    this.observe = __bind(function(type, callback) {
      wrapper.config.observers[type] = callback;
      return this;
    }, this);
    return this;
  };
  wrapper.start = function() {
    if (wrapper.config.publicDir != null) {
      wrapper.config['app'] = wrapper.app;
      return wrapper.status.instance = wrapper.server.bind(wrapper.config);
    } else {
      throw new Exception('Not configured');
    }
  };
}).call(this);
