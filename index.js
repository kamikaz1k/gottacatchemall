var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var MongoClient = require('mongodb').MongoClient;
var dataBase = {}; // Reference

var mongoURI = process.env.MONGODB_URI; 
// Connect to the db
MongoClient.connect(mongoURI, function(error, db) {
  if(!error) {
    console.log("We are connected");
    dataBase = db;

    db.createCollection('test', function(error, collection) {
        if (!error) {
            console.log("Collection retrieved: ");//, collection);
        } else {
            console.error("Error creating collection...", error);
        }
    });

    db.createCollection('encounters', function(error, collection) {
        if (!error) {
            console.log("Collection retrieved: ");//, collection);
            collection.createIndex( { loc : "2dsphere" } );
        } else {
            console.error("Error creating collection...", error);
        }
    });

    // db.createCollection('test', {strict:true}, function(err, collection) {});

  } else {
    console.error("Error connecting to DB", error)
  }
});

app.set('port', (process.env.PORT || 5000));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Shared lib scripts
app.use('/libs', express.static(__dirname + '/libs'));

app.get('/', function (request, response) {
  response.render('pages/locate');
  // response.render('pages/game');
});

app.get('/ping', function (request, response) {
    // response.send({})
    console.log(dataBase);
});

app.get('/submit', function(request, response) {
    response.render('pages/submit_finding');
});

function encounter (pokemon_id, pokemon_name, latitude, longitude, datetime, trainer_level) {
    this.pokemon_id = pokemon_id;
    this.pokemon_name = pokemon_name; 
    this.latitude = latitude; 
    this.longitude = longitude; 
    this.loc = { type: "Point", coordinates: [ parseFloat(longitude), parseFloat(latitude) ] };
    this.datetime = datetime; 
    this.trainer_level = trainer_level;
}

app.post('/submit', function(request, response) {
    if (request.query.entry) {
        var id = Math.floor(Math.random() * 10000);
        var entry = JSON.parse(request.query.entry);
        console.log("entry: ",entry);
        newEntries = [];
        for (i = 0; i < entry.pokemon.length; i++) {
            var newEntry = entry.pokemon[i];
            newEntries.push(new encounter(newEntry.id, 
                            newEntry.text, 
                            entry.location.latitude, 
                            entry.location.longitude, 
                            entry.datetime, 
                            entry.trainer_level));
        }

        // Ensure there is atleast one entry, and that it has a pokemon ID and location info
        if (newEntries[0] && newEntries[0].pokemon_id && newEntries[0].latitude && newEntries[0].longitude) {

            dataBase.collection('encounters')
            .insert(newEntries, function(error, result) { 
                if (error) { 
                    console.log("Insertion ERROR result:", error); 
                } else {
                    console.log("Post insert result:", result); 
                }
            });

            response.send({ message: "Entered find"});
            
        } else {
            console.log("Incorrect:",newEntry);
            response.status(400).send({ error: 'Bad Request :: new Entry invalid' });
        }
    }
})

app.get("/dump", function(request, response) { 
    // response.send({ message: "Still working on it..." }); 
    // dataBase.collection('test').find().toArray(function(error, items) {
    dataBase.collection('encounters').find().toArray(function(error, items) {
        if (!error) {
            response.render('pages/dump', { items: items }); 
            // response.send({ message: "Dump of collection: Test", data: items }); 
        } else {
            console.error("Dump Error:", error);
            response.status(500).send({ error: 'DUMP FAILED' });
        }
    });
});

app.get("/query", function(request, response) { 

    if (request.query.pokemon_id || (request.query.latitude && request.query.longitude)) {

        var options = {};
        if (request.query.pokemon_id) options.pokemon_id = request.query.pokemon_id;

        if (request.query.latitude && request.query.longitude) {
            var range = request.query.range || 5;

            options.loc = { 
                $geoWithin: { 
                    $centerSphere: [ 
                        [ parseFloat(request.query.longitude), parseFloat(request.query.latitude) ], 
                        range / 3963.2 // range is in miles -- convert to ...something
                    ] 
                } 
            }

        }

        dataBase.collection('encounters').find(options).toArray(function(error, items) {
            if (!error) {
                response.render('pages/dump', { items: items }); 
                // response.send({ message: "Dump of collection: Test", data: items }); 
            } else {
                console.error("Dump Error:", error);
                response.status(500).send({ error: 'DUMP FAILED' });
            }
        });
    } else {     
        response.status(400).send({ error: 'Query not recognized...' });
    }
});

// Get location of encounter
app.post('/location/:coordinates', function(request, response) {
  console.log("Coordinate:", request.params.coordinates);
  // response.send(request.params.coordinates);
  var coordinates = request.params.coordinates.split(":");
  var encounter = Math.random() * 2 > 0.5;
  response.send({ lat: coordinates[0], lng: coordinates[1], encounter: encounter });

});

app.listen(app.get('port'), function() {
  console.log('### Node app is running on port', app.get('port'));
});


