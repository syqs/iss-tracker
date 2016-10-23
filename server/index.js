var express = require('express');
var Path = require('path');
var routes = express.Router();
var http = require('http');
var Twitter = require('twitter');

//route to index.html
var assetFolder = Path.resolve(__dirname, '../client/');
routes.use(express.static(assetFolder));

// Get twitter data
routes.get('/api', function(req, res) {

  // Get this data from your twitter apps dashboard 
  // Should be set to use enviroment variables instead
  var config = {
    "consumerKey": "",
    "consumerSecret": "",
    "bearer_token": ""
  }
  
  var twitter = new Twitter(config);
  
  //Get 10 tweets containing the keywords
  twitter.get('search/tweets', {
    q: 'space OR spacemedicine OR nasa OR Anasa OR spacex OR Aspacex OR mars OR zerogravity OR rocketscience',
    count: 10
  }, function(error, tweets, response) {
   // var tweets = tweets || "twiter data"
   res.send(tweets)
  });

});

//  Get the location of ISS
routes.get('/issLocation', function(req, res) {

  // Initiate a call to iss-now : idealy this would go into seperate model file
  http.get('http://api.open-notify.org/iss-now.json', function(response) {
    
    // Continuously update stream with data
    var body = '';
    response.on('data', function(data) {
      body += data;
    });
    response.on('end', function() {

      // Data reception is done, send it to client!
      var iss = JSON.parse(body) || "no data recieved";
      res.send(iss)
    });
  });
});

// Setup express to serve the frontend to the client
if (process.env.NODE_ENV !== 'test') {

  // The Catch-all Route
  // This is for supporting browser history pushstate.
  routes.get('/*', function(req, res) {
    res.sendFile(assetFolder + '/index.html')
  })

  // We're in development or production mode;
  // create and run a real server.
  var app = express();

  // Parse incoming request bodies as JSON
  app.use(require('body-parser').json());

  // Mount our main router
  app.use('/', routes);

  // Start the server!
  var port = process.env.PORT || 8000;
  app.listen(port);
  console.log("Listening on port", port);
} else {

  // We're in test mode; make this file importable instead.
  module.exports = routes;
}