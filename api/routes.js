/*
  Rates main application routes file
  Author: Sergiy Domanitskiy
  Date: May 2016
*/


module.exports = function(app, redis, emitter) {
  var pointsCtrl = require('./controllers/pointsCtrl')(redis);

  app.opts(/\.*/, function (req, res, next) {
    res.send(200);
    return next();
  });

  app.post('/socket.io', function (req, res, next) {
    res.send(200);
    return next();
  });

  app.get('/update', pointsCtrl.update);
  app.get('/get/:name', pointsCtrl.get);

};