server = module.exports

# Constants
server.events =
  BEFORE_START      : 'before:start'
  AFTER_START       : 'after:start'
  SERVER_CONFIGURE  : 'server:configure'
  APP_CONFIGURE     : 'app:configure'
  SERVER_START      : 'server:start'

# Include required modules
server.modules =
  express: require('express')
  events: require('events')
  Futures: require('futures')


# Configuration
server._config = {}
server._container = null
server._event = new server.modules.events.EventEmitter()
server._logger = console

server.on = (type, callback) ->
  server._event.on(type, callback)

# Set internal event listeners
server.on server.events.SERVER_START, (next) ->
  server._logger.log('Fired - ' + server.events.SERVER_START)
  server._container.listen(server._config.port, server._config.host)
  next(true)

server.on server.events.BEFORE_START, (next, container) ->
  server._logger.log('Fired - ' + server.events.BEFORE_START)
  next()

server.on server.events.SERVER_CONFIGURE, (next, config, container) ->
  server._logger.log('Fired - ' + server.events.SERVER_CONFIGURE)

  # Configure default settings
  container.use(server.modules.express.methodOverride())
  container.use(server.modules.express.bodyParser())
  container.use(container.router)
  server._logger.log('Default modules configured')

  # Configure custom settings
  observer = server._config.observers[server.events.SERVER_CONFIGURE]
  if observer?
    observer(config, container)

  next()

server.on server.events.APP_CONFIGURE, (next, config, container) ->
  server._logger.log('Fired - ' + server.events.APP_CONFIGURE)

  # TODO: Make it scopable (so dev, prod, staging)
  server._logger.log('Configuring - ' + server._config.publicDir + ' as document root')
  container.use(server.modules.express.static(server._config.publicDir));
  container.use(server.modules.express.errorHandler({ dumpExceptions: true, showStack: true }));

  next()

server.on server.events.AFTER_START, (next, status, config, container) ->
  server._logger.log('Fired - ' + server.events.AFTER_START + ' status - ' + status)
  next(status)


#
# Configure server instance
server.configure = (parentNext, config) ->
  server._config = config
  sequence = server.modules.Futures.sequence()

  # Initiate express
  server._container = server.modules.express.createServer()

  sequence
    .then (next) ->
      # Emit before:start
      server._event.emit(server.events.BEFORE_START, next, server._container)

    .then (next) ->
      # Emit server:configure
      server._event.emit(server.events.SERVER_CONFIGURE, next, server._config, server._container)

    .then (next) ->
      # Emit app:configure
      server._event.emit(server.events.APP_CONFIGURE, next, server._config, server._container)
      parentNext()

#
# Start server with the given configuration
server.bind = (config) ->
  sequence = server.modules.Futures.sequence()

  sequence
    .then (next) ->
      server.configure next, config

    .then (next) ->
      # Emit server:start
      server._event.emit(server.events.SERVER_START, next, server._container)

    .then (next, status) ->
      # Emit after:start
      server._event.emit(server.events.AFTER_START, next, status, server._config, server._container)

