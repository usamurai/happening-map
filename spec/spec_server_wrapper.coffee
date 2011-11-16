vows = require 'vows'
assert = require 'assert'
server = require '../lib/server-wrapper'

vows.describe('ServerWrapper')
    .addBatch(

      'check configurability':
        '#typeof(function)'     : -> assert.equal(typeof(server), 'object')
        '#configure'            : -> assert.equal(typeof(server.configure()), 'object')
        '#configure.publicDir'  : -> assert.equal(typeof(server.configure().publicDir), 'function')
        '#configure.indexFile'  : -> assert.equal(typeof(server.configure().indexFile), 'function')
        '#configure.host'       : -> assert.equal(typeof(server.configure().host), 'function')
        '#configure.port'       : -> assert.equal(typeof(server.configure().port), 'function')
        '#configure.observe'    : -> assert.equal(typeof(server.configure().observe), 'function')

        'not instantiable':
          '#new': -> assert.throws -> new server()

        'chainable configure': ->
          server = require '../lib/server-wrapper'
          dir = '/test/test1'
          indexFile = 'index.file'
          host = '0.0.0.0'
          port = 3000
          type = 'server:configure'

          inst = server.configure()

          assert.doesNotThrow ->
            inst = inst.publicDir(dir)
          assert.equal(inst.config.publicDir, dir)

          assert.doesNotThrow ->
            inst = inst.indexFile(indexFile)
          assert.equal(inst.config.indexFile, indexFile)

          assert.doesNotThrow ->
            inst = inst.host(host)
          assert.equal(inst.config.host, host)

          assert.doesNotThrow ->
            inst = inst.port(port)
          assert.equal(inst.config.port, port)

          assert.doesNotThrow ->
            inst = inst.observe(type, ->)
          assert.isNotNull(inst.config.observers[type])

      '#start':
        'start method should exist'   : -> assert.typeOf(require('../lib/server-wrapper').start, 'function')
        'throw not configured error'  : -> assert.throws(require('../lib/server-wrapper').start())

        'successfully start server on 3000 port': ->
          server.configure()
            .publicDir('./public')
            .indexFile('index.html')
            .observe('server:configure', -> console.log('server:configure called'))
          server.start()

    ).export(module)



