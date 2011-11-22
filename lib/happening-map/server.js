(function() {
  var server;
  server = module.exports;
  server.events = {
    BEFORE_START: 'before:start',
    AFTER_START: 'after:start',
    SERVER_CONFIGURE: 'server:configure',
    APP_CONFIGURE: 'app:configure',
    SERVER_START: 'server:start'
  };
  server.modules = {
    express: require('express'),
    events: require('events'),
    Futures: require('futures')
  };
  server._config = {};
  server._container = null;
  server._event = new server.modules.events.EventEmitter();
  server._logger = console;
  server.on = function(type, callback) {
    return server._event.on(type, callback);
  };
  server.on(server.events.SERVER_START, function(next) {
    server._logger.log('Fired - ' + server.events.SERVER_START);
    server._container.listen(server._config.port, server._config.host);
    return next(true);
  });
  server.on(server.events.BEFORE_START, function(next, container) {
    server._logger.log('Fired - ' + server.events.BEFORE_START);
    return next();
  });
  server.on(server.events.SERVER_CONFIGURE, function(next, config, container) {
    var observer;
    server._logger.log('Fired - ' + server.events.SERVER_CONFIGURE);
    container.use(server.modules.express.methodOverride());
    container.use(server.modules.express.bodyParser());
    container.use(container.router);
    server._logger.log('Default modules configured');
    observer = server._config.observers[server.events.SERVER_CONFIGURE];
    if (observer != null) {
      observer(config, container, server);
    }
    return next();
  });
  server.on(server.events.APP_CONFIGURE, function(next, config, container) {
    server._logger.log('Fired - ' + server.events.APP_CONFIGURE);
    server._logger.log('Configuring - ' + server._config.publicDir + ' as document root');
    container.use(server.modules.express.static(server._config.publicDir));
    container.use(server.modules.express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    return next();
  });
  server.on(server.events.AFTER_START, function(next, status, config, container) {
    server._logger.log('Fired - ' + server.events.AFTER_START + ' status - ' + status);
    return next(status);
  });
  server.configure = function(parentNext, config) {
    var sequence;
    server._config = config;
    sequence = server.modules.Futures.sequence();
    server._container = server.modules.express.createServer();
    return sequence.then(
        function(next) {
          return server._event.emit(server.events.BEFORE_START, next, server._container);
        }).then(
        function(next) {
          return server._event.emit(server.events.SERVER_CONFIGURE, next, server._config, server._container);
        }).then(function(next) {
      server._event.emit(server.events.APP_CONFIGURE, next, server._config, server._container);
      return parentNext();
    });
  };
  server.bind = function(config) {
    var sequence;
    sequence = server.modules.Futures.sequence();
    return sequence.then(
        function(next) {
          return server.configure(next, config);
        }).then(
        function(next) {
          return server._event.emit(server.events.SERVER_START, next, server._container);
        }).then(function(next, status) {
      return server._event.emit(server.events.AFTER_START, next, status, server._config, server._container);
    });
  };
}).call(this);
