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


    timestamp: function () {
      var d = new Date();
      var month = d.getUTCMonth();
      if (month < 10) {
        month = '0' + String(month);
      }

      return String(d.getUTCFullYear()) + String(month) + String(d.getUTCDate()) + String(d.getUTCHours()) + String(d.getUTCMinutes()) + String(d.getUTCSeconds());
    },

 /*
    scan: function (name, cursor) {
      var that = this;
      redis.scan(
        cursor,
        'MATCH', 'point_' + name + '_*',
//        'COUNT', config.source.expireSec,
        'SORT', 'ASC',
//        'TTL': 10,
        function (err, res) {
            if (err) throw err;

            // Update the cursor position for the next scan

            // get the SCAN result for this iteration
            var keys = res[1];

            console.log('scanned keys: ', keys);

            // Remember: more or less than COUNT or no keys may be returned
            // See http://redis.io/commands/scan#the-count-option
            // Also, SCAN may return the same key multiple times
            // See http://redis.io/commands/scan#scan-guarantees
            // Additionally, you should always have the code that uses the keys
            // before the code checking the cursor.
            if (keys.length > 0) {
                console.log('Array of matching keys', keys);
            }

            // It's important to note that the cursor and returned keys
            // vary independently. The scan is never complete until redis
            // returns a non-zero cursor. However, with MATCH and large
            // collections, most iterations will return an empty keys array.

            // Still, a cursor of zero DOES NOT mean that there are no keys.
            // A zero cursor just means that the SCAN is complete, but there
            // might be one last batch of results to process.

            // From <http://redis.io/commands/scan>:
            // 'An iteration starts when the cursor is set to 0,
            // and terminates when the cursor returned by the server is 0.'
            if (res[0] === '0') {
                return true;
            }

            return keys; // that.scan(name, res[0]);
        }
    },
 */

    // get latest points by name
    list: function (name, cb) {
      var that = this;

      // redis.scan('point_' + name, cb);
      //   this.scan(name, cb);
      cb();

      // var keys = redis.keys()
    },


    // Add new fresh point to redis
    update: function (cb) {
      this.parse(function (err, rates, ut) {
        if (!err && rates) {
          console.log('Add points:');
          _(rates).forEach(function(value, name) {
            var pointKey = "point_" + name + "_" + ut;
            redis.set(pointKey, value);
            redis.expire(pointKey, config.source.expireSec);
            console.log(pointKey);
          });
        }

        if ('function ' == typeof cb) {
          cb(err, rates);
        }
      });
    },


    // Get latest rates
    parse: function (cb) {

      var ut = Math.floor(Date.now() / 1000);
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
            // Count rates
            var rates = {};
            // Use more advanced math lib, check: ( 0.73699 + 0.73707 ) / 2 =  0.7370300000000001
            _(result.Rates).forEach(function(rate) {
              var value = (parseFloat(rate.Bid) + parseFloat(rate.Ask)) / 2;
              rates[rate.Symbol] = parseFloat(value.toFixed(config.source.roundAccuracy));
            });

            cb(null, rates, ut);
          }

        });

      });
    },


    initUpdates: function () {
      var sched = later.parse.recur().every(this.config.updateIntervalSec).second();
      this.updateTimer = later.setInterval(this.update.bind(this), sched);
    }

  }
}

module.exports = Service;
