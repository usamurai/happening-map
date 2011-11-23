(function() {
  var sys = require('sys'),
      https = require('https'),
      Twitter = require('twitter'),
      Futures = require('futures');

  var app = module.exports;

  /**
   * Implement social stream
   */
  app.socialStream = {

    storage: {
      twitter: [], facebook: [],

      all: function() {

        console.log ('location in storage ' );

        var items = [],
            i;

        for (i in app.socialStream.storage.twitter) {
          items.push(app.socialStream.storage.twitter[i]);
        }

        for (i in app.socialStream.storage.facebook) {
          items.push(app.socialStream.storage.facebook[i]);
        }
        //console.log (sys.inspect(items));
        return items;
      }
    },

    itemRefs: {
      facebook: '',
      twitter: 0,

      isFresh: function(type, object) {
        if (object && object.id) {
          switch (type) {
            case 'facebook':
              var lastId = app.socialStream.itemRefs.facebook;

              if (lastId) {
                var parts = lastId.split('_');
                var newIdParts = object.id.toString().split('_');

                var oldIdPrefix = parseInt(parts[0], 10),
                    oldIdSuffix = parseInt(parts[1], 10),
                    newIdPrefix = parseInt(newIdParts[0], 10),
                    newIdSuffix = parseInt(newIdParts[1], 10);

                if (newIdPrefix >= oldIdPrefix && newIdSuffix > oldIdSuffix) {
                  return true;
                }
              } else {
                return true;
              }

            case 'twitter':
              var lastId = app.socialStream.itemRefs.twitter,
                  newId = object.id;

              if (lastId) {
                if (newId > lastId) {
                  return true;
                }
              } else {
                return true;
              }
          }
        }

        return false;
      }
    },

    /**
     * Accumulate facebook and twitter streams and merge them together
     * Specified callback send out the merged list.
     *
     * @param callback this should accept list of items.
     */
    all: function(keyword,location,callback) {

      console.log ('All ' + sys.inspect (location));
      var sequence = Futures.sequence();
      var items = [];

      sequence
        .then(function(next) {
          app.socialStream.facebook(next, keyword, 10);
        })
        .then(function(next, fbItems) {

            app.socialStream.twitter(next, fbItems, keyword, 10,location);
        })
        .then(function(next, fbItems, twitterItems) {
          var index, item;

          for (index in fbItems) {
            item = fbItems[index];
            items.push({
              text        : item.text,
              'geo'       : item.geo,
              'username'  : item.username,
              'address'   : item.address,
              'user'      : item.user,
              'avatar'    : item.avatar,
              'time'      : item.time
            });
          }

          for (index in twitterItems) {
            item = twitterItems[index];

            items.push({
              text        : item.text,
              'geo'       : item.geo,
              'username'  : item.username,
              'address'   : item.address,
              'user'      : item.user,
              'avatar'    : item.avatar,
              'time'      : item.time
            });
          }

          //console.log ('Items:'+sys.inspect(items));
          //return items;
          callback(items);
      });
    },

    facebook: function(next, keyword, max) {
      var fbItems = [];
      var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/search?q=' + keyword,
        //method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      };

      https.request(options, function(res) {
        var body = [];

        res.setEncoding('utf8');
        res.on('data', function (chunk) { body.push(chunk); });

        res.on('end', function () {
          var data;
          var error;

          try { data = JSON.parse(body.join('')); }
          catch (err) {
            data = null;
            error = e;
          }

          if (data && data.error) {
            // Graph API error
            //callback(data.error, null);
            //console.log (data.error);
          } else if (data) {
            // success
            var results = data.data;
            if (results) {
              for (var index in results) {
                var item = results[index];
                if (app.socialStream.itemRefs.isFresh('facebook', item)) {
                  var itemHash = {
                    id: item.id,
                    text: item.message,
                    'geo': null,
                    'address':'',
                    'username': item.from.name,
                    'user': item.from.id,
                    'avatar': '',
                    'time': item.created_time
                  };

                  fbItems.push(itemHash);
                  app.socialStream.storage.facebook.push(itemHash);
                  app.socialStream.itemRefs.facebook = item.id;
                }
              }

            }
          } else {
            // error
            // callback(error, null);
          }

          next(fbItems);
        });

      }).end();
    },

    twitter: function(next, items, keyword, max,location) {

      var twit = new Twitter();

      geoLocation = ""+location.latitude +","+location.longitude+","+"1000mi";

      twit.search('accident',{geocode:geoLocation} ,function(data) {
        var twitterItems = [];
        try {
          var results = data.results;
          //console.log ('Results' + sys.inspect (results));
          if (results) {
            for (var index in results) {
              var item = results[index];
              if (app.socialStream.itemRefs.isFresh('twitter', item)) {
             var itemHash = {
                  id: item.id,
                  text: item.text,
                  'geo': item.geo,
                  'address':item.location,
                  'username': item.from_user_name,
                  'user': item.from_user,
                  'avatar': item.profile_image_url,
                  'time': item.created_at
                };

                twitterItems.push(itemHash);
                app.socialStream.storage.twitter.push(itemHash);
                app.socialStream.itemRefs.twitter = item.id;
              }
            }

          }

        } catch (error) {
          console.log(error);
          console.log('-!- Error while parsing tweet.');
        }
        //console.log ( 'twitter inspect : '+ sys.inspect (twitterItems));
        next(items, twitterItems);

      });


    }
  };
}).call(this);
