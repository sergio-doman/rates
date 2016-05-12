/*
  Rates points service
  Author: Sergiy Domanitskiy
  Date: May 2016
*/

var _ = require('lodash');
var config = require('../config');
var fetch = require('node-fetch');
var dejsonp = require('dejsonp');
var later = require('later');

var Service = function (redis) {
  var restify = require('restify');

  return {

    updateTimer: null,


    // Get unixtime (seconds)
    ut: function () {
      return Math.floor(Date.now() / 1000);
    },


    // Get UTC timestamp
    timestamp: function () {
      var d = new Date();
      var month = d.getUTCMonth();
      if (month < 10) {
        month = '0' + String(month);
      }

      return String(d.getUTCFullYear()) + String(month) + String(d.getUTCDate()) + String(d.getUTCHours()) + String(d.getUTCMinutes()) + String(d.getUTCSeconds());
    },


    // Get latest points by asset name
    // TODO: Save to redis for 1 sec
    list: function (name, cb) {
      var asset = _.find(config.assets, function(o) { return name == o.name; });
      if (!asset) {
        cb('Invalid name');
        return;
      }

      var minUt = String(this.ut() - config.pointsFilterSec);
      var diffLen = String(config.pointsFilterSec).length;
      var keyFilter = 'point_' + name + '_' + (minUt).substr(0, minUt.length - diffLen)  + '*';
      redis.keys(keyFilter, function (err, keys) {
          if (err) {
            cb(err);
          }
          else {

          var list = [];
          _(keys).forEach(function(key) {
            var keyUt = String(key).match(/_(\d+)$/)[1];
            if (keyUt >= minUt) {
              list.push(key);
            }
          });

          redis.mget(list, function (err, res) {
            if (err) {
              cb(err);
            }
            else {

              var points = [];
              _(res).forEach(function(point) {
                var p = JSON.parse(point);
                p.assetName = name;
                p.assetId = asset.id;
                points.push(p);
              });

              points = _.sortBy(points, function(p) { return p.time; });
              cb(null, points);
            }
          });
        }
      });
    },


    // Add new fresh point to redis
    update: function (cb) {
      this.parse(function (err, rates, ut) {
        if (!err && rates) {
          _(rates).forEach(function(value, name) {
            var pointKey = "point_" + name + "_" + ut;
            var pointValue = {time: ut, value: value};
            redis.set(pointKey, JSON.stringify(pointValue));
            redis.expire(pointKey, config.source.expireSec);
          });
        }

        if ('function ' == typeof cb) {
          cb(err, rates);
        }
      });
    },


    // Parse latest rates
    // TODO: Use more advanced math lib, check: ( 0.73699 + 0.73707 ) / 2 =  0.7370300000000001
    parse: function (cb) {

      var ut = this.ut();
      fetch(config.source.url + this.timestamp() + '&_=' + String(ut))
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

            var rates = {};
            _(result.Rates).forEach(function(rate) {
              var value = (parseFloat(rate.Bid) + parseFloat(rate.Ask)) / 2;
              rates[rate.Symbol] = parseFloat(value.toFixed(config.source.roundAccuracy));
            });

            cb(null, rates, ut);
          }

        });

      });
    },


    // Start continuous parsing
    initUpdates: function () {
      var sched = later.parse.recur().every(config.updateIntervalSec).second();
      this.updateTimer = later.setInterval(this.update.bind(this), sched);
    }

  }
}

module.exports = Service;
