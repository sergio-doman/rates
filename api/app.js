/*
  Rates main application file
  Author: Sergiy Domanitskiy
  Date: May 2016
*/

var config = require('./config');
var restify = require('restify');
var app = restify.createServer(config.RESTIFY);

// io.set('origins', '*192.168.1.105:8080');
// var ioredis = require('socket.io-redis');
//io.adapter(ioredis(config.REDIS.IO));
// var emitter = require('socket.io-emitter')(config.REDIS.IO);
var emitter = null;

// Redis
var redis = require('redis').createClient(config.REDIS.APP);


// Error handler  // Uncomment it !!
// process.on('uncaughtException', function(ex) {
//  log to winston
//  console.log('UncaughtException:', ex);
// });

// Restify
app.pre(restify.pre.userAgentConnection()); // Allow curl requests
app.use(
  // Cross domain policy
  function crossOrigin(req,res,next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token, Authorization, X-Requested-With, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
    res.setHeader('Access-Control-Max-Age', '1728000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    return next();
  }
);
app.pre(restify.pre.sanitizePath());
app.use(restify.acceptParser(app.acceptable));
app.use(restify.queryParser());
app.use(restify.bodyParser());
app.use(restify.authorizationParser());
app.listen(config.service.PORT, function () {
   console.log('Service started at port', config.service.PORT);
});

require('./routes')(app, redis, emitter);

// Share static files
app.get(/\/public\/?.*/, restify.serveStatic({
    directory: __dirname
}));

/*
var io = require('socket.io')(app);
io.on('connection', function (socket) {
  console.log('connection');

  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });
});
*/

var pointsSrv = require('./services/pointsSrv')(redis);
pointsSrv.initUpdates();