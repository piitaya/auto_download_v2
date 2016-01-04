//Define base path
global.__base = __dirname + '/';
global.__secret = "secretTest";

// set up ========================
var express  = require('express');
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var path = require('path');
var db = require('./models/db');
var config = require('config');
var passport = require('passport');
var middleware = require('./middleware');

var app = module.exports = express();

require('./routes/auth/passport')(passport); // pass passport for configuration

app.use('/app', express.static(__dirname + '/../client/app'));                // set the static files location /public/img will be /img for users
app.use('/assets', express.static(__dirname + '/../client/assets'));

app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

var API = {};
API.auth = require('./routes/api/auth');
API.settings = require('./routes/api/settings');
API.torrents = require('./routes/api/torrents');
API.movieDB = require('./routes/api/moviedb');

// Routes
// Authentication
app.post('/api/auth/signup', API.auth.localSignup);
app.post('/api/auth/login', API.auth.localLogin);

// Settings 
app.get('/api/settings', middleware.authenticateUser, API.settings.get);
app.post('/api/settings/t411/link', middleware.authenticateUser, API.settings.linkT411);
app.get('/api/settings/t411/check', middleware.authenticateUser, API.settings.checkT411);
app.post('/api/settings/movieDB/link', middleware.authenticateUser, API.settings.linkMovieDB);
app.get('/api/settings/movieDB/check', middleware.authenticateUser, API.settings.checkMovieDB);

// Torrents
app.get('/api/torrents/:term', middleware.authenticateUser, API.torrents.search);

// Movie and TV
app.get('/api/moviedb/search/movie', middleware.authenticateUser, API.movieDB.searchMovie);
app.get('/api/moviedb/movie/:id', middleware.authenticateUser, API.movieDB.getMovieInfo);

app.get('/api/moviedb/search/tv', middleware.authenticateUser, API.movieDB.searchTv);
app.get('/api/moviedb/tv/:id', middleware.authenticateUser, API.movieDB.getTvInfo);

app.all('/*', function(req, res) {
	res.sendFile(path.resolve(__dirname + '/../client/index.html'));
});

// listen (start app with node server.js) ======================================
var port = 8181;
app.listen(port);
console.log("App listening on port " + port);