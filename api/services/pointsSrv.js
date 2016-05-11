/*
  Rates points service
  Author: Sergiy Domanitskiy
  Date: May 2016
*/

var _ = require('lodash');
var config = require('../config');
var fetch = require('node-fetch');
var dejsonp = require('dejsonp');
// var dateFormat = require('dateformat');
// var moment = require('moment-timezone');

var Service = function (redis) {
  var restify = require('restify');

  return {


    timestamp: function () {
      var d = new Date();
      var month = d.getUTCMonth();
      if (month < 10) {
        month = '0' + String(month);
      }

      return String(d.getUTCFullYear()) + String(month) + String(d.getUTCDate()) + String(d.getUTCHours()) + String(d.getUTCMinutes()) + String(d.getUTCSeconds());
    },


    // Get fresh rates
    update: function (cb) {

      fetch(config.source.url + this.timestamp() + '&_=' + String(Math.floor(Date.now() / 1000)))
      .then(function(res) {
          return res.text();
      }).then(function(body) {

         dejsonp.exec(body, config.source.functionName,function(err, result) {
          if (err) {
            cb(err);
          }
          else if (!result) {
            cb('Wrong response');
          }
          else {
            // Count rates
            var rates = {};
            // Use some advanced math lib, check: ( 0.73699 + 0.73707 ) / 2 =  0.7370300000000001
            _(result.Rates).forEach(function(rate) {
              var value = (parseFloat(rate.Bid) + parseFloat(rate.Ask)) / 2;
              rates[rate.Symbol] = parseFloat(value.toFixed(config.source.roundAccuracy));
            });

            cb(null, rates);
          }

        });

      });
    }

  }
}

module.exports = Service;
