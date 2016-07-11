var express = require('express');
var bodyParser = require('body-parser')
var app = express();

// app.use(bodyParser());

// app.use(bodyParser.json())
// var urlencodedParser = bodyParser.urlencoded({ extended: false })

var entry = {
        // {
        //     pokemon: "001",
        //     location: {
        //         latitude: "",
        //         longitude: ""
        //     },
        //     submitter: {
        //         user: {
        //             id: "98765",
        //             username: "ABBA"
        //         } 
        //     }
        // }
}

app.set('port', (process.env.PORT || 5000));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/game');
});

app.get('/submit', function(request, response) {
    response.render('pages/submit_finding');
});

app.post('/submit', function(request, response) {
    if (request.query.entry) {
        var id = Math.floor(Math.random() * 10000);
        var newEntry = JSON.parse(request.query.entry);
        entry [id] = newEntry;

        console.log("Updated:",entry);
        response.send({ message: "Entered find"});
    }
})

// Get location of encounter
app.post('/location/:coordinates', function(request, response) {
  console.log("Coordinate:", request.params.coordinates);
  // response.send(request.params.coordinates);
  var coordinates = request.params.coordinates.split(":");
  var encounter = Math.random() * 2 > 0.5;
  response.send({ lat: coordinates[0], lng: coordinates[1], encounter: encounter });

});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


