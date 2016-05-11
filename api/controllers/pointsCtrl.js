/*
  Rates points controller
  Author: Sergiy Domanitskiy
  Date: May 2016
*/


var _ = require('lodash');

var Controller = function (redis) {

  var pointsSrv = require('../services/pointsSrv')(redis);
  return {

    update: function (req, res, next) {
      pointsSrv.update(function (err, rates) {
        if (err) {
          // log error to safe place
          console.log('Error: ', err);
        }

        res.send({result: !! err, rates: rates});
        return next();

      });


    } // update

  }

};

module.exports = Controller;
