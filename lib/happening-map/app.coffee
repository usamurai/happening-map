app = module.exports
app.socialStream =

  all: ->
    items = []
    facebookItems = app.socialStream.facebook('accident', 10)
    twitterItems = app.socialStream.twitter('accident', 10)

    items.push item for item in facebookItems
    items.push item for item in twitterItems
    items

  # Facebook stream lookup implementation
  facebook: (keyword, max) ->
    # TODO: implement logic
    []

  # Twitter stream lookup implementation
  twitter: (keyword, max) ->
    # TODO: implement logic
    []
