
/**
 * Module dependencies.
 */

var commander = require('commander')
  , cron      = require('cron')
  , express   = require('express')
  , http      = require('http')
  , path      = require('path')
  , request   = require('request')
  , routes    = require('./routes')
  , user      = require('./routes/user')
  ;

commander.
    option('-k, --key <key>', 'Your OpenExchangeRates API key', String).
    parse(process.argv);

if (!commander.key) {
  console.log("Please specify your OpenExchangeRates API key!");
  process.exit(1);
}

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
var Mongoose = require('mongoose');
var db = Mongoose.createConnection('localhost', 'mystore');

// Construct models
var ProductSchema = require('./models/Product.js').ProductSchema;
var Product = db.model('products', ProductSchema);

var FxSnapshotSchema = require('./models/FxSnapshot.js').FxSnapshotSchema;
var FxSnapshot = db.model('fxsnapshots', FxSnapshotSchema);

// FX rates service
var FxRates = require('./fx_rates.js').FxRates(
  commander.key, cron, request, FxSnapshot);

FxRates.init(function(error, rates) {
  if (error || !rates) {
    console.log("Failed to load FX Rates: " + error);
  } else {
    console.log("Successfully loaded exchange rates:");
    console.log(rates);
  }
});

// Put a sample product into the database if there isn't one
Product.count({}, function(error, count) {
  if (count == 0) {
    new Product({
      name : "Omega Seamaster Planet Ocean 600M",
      price : {
        price : 10000,
        currency : "USD"
      },
      picture : "http://ecx.images-amazon.com/images/I/51xEb3-TohL.jpg"
    }).save();
  }
});

app.get('/', routes.index(FxRates, Product));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
