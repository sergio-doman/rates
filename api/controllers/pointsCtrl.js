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

      pointsSrv.list(req.params.name, function (err, list, list2) {

        res.send({err: err, list: list, name: req.params.name, list2: list2});

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
