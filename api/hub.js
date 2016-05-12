/*
  Rates socket hub
  Author: Sergiy Domanitskiy
  Date: May 2016
*/

var _ = require('lodash');
var config = require('./config');

module.exports = function (io, redis, emitter) {
  var pointsSrv = require('./services/pointsSrv')(redis, emitter);

  io.on('connection', function (socket) {
    socket.assetId = null;
    console.log('Client connected');


    // Get assets list
    socket.on('assets', function () {
      var message = {message: {assets: config.assets}};
      console.log('assets', message);
      socket.emit('assets', message);
    });

    // Subscribe to channel
    socket.on('subscribe', function (data) {
      if (socket.assetId !=  data.message.assetId) {
        console.log('subscribe', data);
        var asset = _.find(config.assets, function(a) { return data.message.assetId == a.id; });
        if (asset) {

          pointsSrv.list(asset.id, function (err, points) {

            if (err) {
              console.log(err);
            }
            else {

              if (socket.assetId) {
                socket.leave('asset_' + socket.assetId);
              }

              socket.assetId = asset.id;
              socket.join('asset_' + socket.assetId);

              var messageAnswer = {
                message: {
                  points: points
                }
              };

              socket.emit('asset_history', messageAnswer);
            }

          });

        }
      }
    });

  });



}


