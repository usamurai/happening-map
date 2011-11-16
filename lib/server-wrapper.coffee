@version = [0, 1]

wrapper = module.exports

# Required modules
wrapper.server  = require './happening-map/server'
wrapper.app     = require './happening-map/app'
wrapper.util    = require './happening-map/util'

# Server configuration
wrapper.config =
  host: '0.0.0.0'
  port: 3000
  indexFile: "index.html"
  publicDir: null
  observers: []

# Server status
wrapper.status =
  instance: null
  started: false

wrapper.configure = ->

  this.publicDir = (dir) =>
    wrapper.config.publicDir = dir
    this

  this.indexFile = (file) =>
    wrapper.config.indexFile = file
    this

  this.host = (host) =>
    wrapper.config.host = host
    this

  this.port = (port) =>
    wrapper.config.port = port
    this

  this.observe = (type, callback) =>
    wrapper.config.observers[type] = callback
    this

  this

wrapper.start = ->
  if wrapper.config.publicDir?
    wrapper.status.instance = wrapper.server.bind(wrapper.config)
  else
    throw new Exception('Not configured')

