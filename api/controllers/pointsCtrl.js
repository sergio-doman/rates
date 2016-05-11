/*
  Rates points controller
  Author: Sergiy Domanitskiy
  Date: May 2016
*/


var _ = require('lodash');

var Controller = function (redis) {

  var pointsSrv = require('../services/pointsSrv')(redis);
  return {

    get: function (req, res, next) {
      // res.send({name: req.params.name});

      pointsSrv.list(req.params.name, function (err, list) {

        res.send({err: err, list: list});

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
