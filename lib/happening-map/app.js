(function() {
  var app;
  app = module.exports;
  app.socialStream = {
    all: function() {
        
      var facebookItems, item, items, twitterItems, _i, _j, _len, _len2;
      items = [];
      facebookItems = app.socialStream.facebook('accident', 10);
      twitterItems = app.socialStream.twitter('accident', 10);
      for (_i = 0, _len = facebookItems.length; _i < _len; _i++) {
        item = facebookItems[_i];
        items.push(item);
      }
      for (_j = 0, _len2 = twitterItems.length; _j < _len2; _j++) {
        item = twitterItems[_j];
        items.push(item);
      }
      return items;
    },

     facebook: function(keyword, max) {



     $.getJSON("https://graph.facebook.com/search?q="+keyword+"&type=post", function(results) {

         var fbItems       = [];
         $.each(results.data, function(i, item){
             fbItems.push( item.description);
             //fblocations.push( item.description);
          });
         if (fbItems.length == 0)
         {
             return false;
         }else{
            return fbItems;
         }
    });

       
    },
    twitter: function(keyword, max) {

        $.getJSON("http://search.twitter.com/search.json?callback=?&rpp="+max+"&q="+max, function(data) {
            var twittItems =[];

            $.each(data.results, function(i, item){
                if (item.geo !=null)
                {
                    twittItems.push({location: item.geo, status: item.text});
                }

            });

            if (twittItems.length == 0)
            {
                return false;
            }else
            {

                return twittItems;
            }
        });

    }
  };
}).call(this);
