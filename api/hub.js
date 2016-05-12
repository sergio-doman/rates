/*
  Rates socket hub
  Author: Sergiy Domanitskiy
  Date: May 2016
*/

var _ = require('lodash');
var config = require('./config');

module.exports = function (io, redis, emitter) {
  var pointsSrv = require('./services/pointsSrv')(redis);

  io.on('connection', function (socket) {
    console.log('Client connected');

    socket.on('assets', function () {
      var message = {message: {assets: config.assets}};
      console.log('assets', message);
      socket.emit('assets', message);
    });

    socket.on('subscribe', function (data) {
      console.log('subscribe', data);
      var asset = _.find(config.assets, function(a) { return data.message.assetId == a.id; });
      if (asset) {

        pointsSrv.list(asset.id, function (err, points) {

          if (err) {
            console.log(err);
          }
          else {
            var messageAnswer = {
              message: {
                points: points
              }
            };

            socket.emit('asset_history', messageAnswer);
          }


        });

      }


    });

  });



}


