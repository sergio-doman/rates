/*
  Rates points controller
  Author: Sergiy Domanitskiy
  Date: May 2016
*/


var _ = require('lodash');

var Controller = function (redis, emitter) {

  var pointsSrv = require('../services/pointsSrv')(redis, emitter);
  return {

    get: function (req, res, next) {
      var assetId = req.params.id;

      pointsSrv.list(assetId, function (err, points) {
        res.send({err: err, points: points, assetId: assetId});

        return next();
      });
    },

    update: function (req, res, next) {
      pointsSrv.update(function (err, rates) {
        if (err) {
          // log error to safe place
          console.log('Error: ', err);
        }

        res.send({result: !! err, err: err, rates: rates});
        return next();
      });


    } // update

  }

};

module.exports = Controller;
