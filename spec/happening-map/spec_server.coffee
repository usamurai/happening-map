vows    = require 'vows'
assert  = require 'assert'
server  = require '../../lib/happening-map/server'

vows.describe('Server')
    .addBatch(
      'Start server on 3000 port':

        'required methods should be defined': ->
          assert.typeOf(server.bind, 'function')
          assert.typeOf(server.on, 'function')

        '#on': ->
          assert.doesNotThrow ->
            server.on(server.events.BEFORE_START, ->
              console.log('Server starting')
            )
        '#bind': ->
          server.bind({port: 3000})
            .then (next, status) -> assert.isTrue(status)

    ).export(module)
