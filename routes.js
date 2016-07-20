// routes.js
var encounter = require('./models').encounter;

module.exports.locate = function (request, response) {
  response.render('pages/locate');
  // response.render('pages/game');
}

module.exports.ping = function (request, response) {
    response.send({ message: new Date().toISOString() });
}

module.exports.getSubmit = function(request, response) {
    response.render('pages/submit_finding');
}

module.exports.postSubmit = function(request, response) {
    if (request.query.entry) {

        var id = Math.floor(Math.random() * 10000);
        var entry = JSON.parse(request.query.entry);

        console.log("entry: ",entry);

        var newEntries = [];

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

            request.database.collection('encounters')
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
}

module.exports.query = function(request, response) { 

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

        request.database.collection('encounters').find(options).toArray(function(error, items) {
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
}

module.exports.dump = function(request, response) { 
    // response.send({ message: "Still working on it..." }); 
    // database.collection('test').find().toArray(function(error, items) {
    request.database.collection('encounters').find().toArray(function(error, items) {
        if (!error) {
            response.render('pages/dump', { items: items }); 
            // response.send({ message: "Dump of collection: Test", data: items }); 
        } else {
            console.error("Dump Error:", error);
            response.status(500).send({ error: 'DUMP FAILED' });
        }
    });
}
