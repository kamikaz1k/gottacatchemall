var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var database = {}; // Global reference to the DB
var routes = require('./routes');

var mongoURI = process.env.MONGODB_URI || "mongodb://dummy:dummy@ds011800.mlab.com:11800/heroku_jdkwc1hb"; 
// Connect to the db
MongoClient.connect(mongoURI, function(error, db) {
    // Get reference to DB
    if (!error) {
        database = db;
        // Else push error
    } else {
        console.error("Error connecting to DB", error);
    }
});

app.set('port', (process.env.PORT || 5000));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Shared lib scripts
app.use('/libs', express.static(__dirname + '/libs'));

// Patch DB to request object
app.all('*', function(request, response, next) {
    request.database = database;
    next();
});

app.get('/', routes.locate);

app.get('/ping', routes.ping);

app.get('/submit', routes.getSubmit);

app.post('/submit', routes.postSubmit);

app.get('/dump', routes.dump);

app.get('/query', routes.query);

app.listen(app.get('port'), function() {
  console.log('### Node app is running on port', app.get('port'));
});


