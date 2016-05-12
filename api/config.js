var config = {

  "service": {
    "PORT": process.env.PORT || 8080
  },

  "pointsFilterSec": 5 * 60, // How many old points to show
  "updateIntervalSec": 1,

  "source": {
    "url": "https://ratesjson.fxcm.com/DataDisplayer?symbols=EURUSD,USDJPY,GBPUSD,AUDUSD,USDCAD&callback=getRates&since=",
    "functionName": "getRates",
    "roundAccuracy": 6,
    "expireSec": 30 * 60,  // 30 * 60  // When new point will be deleted from redis
  },

  "RESTIFY": {
    "name": "Rates API",
    "version": "1.0.0"
  },

  "REDIS": {
    "IO": {
      "host": "localhost",
      "port": "6379",
      "db": 1
    },
    "APP": {
      "host": "localhost",
      "port": "6379",
      "db": 2
    }
  },

  "assets": [
    { "id": 1, "title": "EUR to USD", "name": "EURUSD" },
    { "id": 2, "title": "USD to JPU", "name": "USDJPY" },
    { "id": 3, "title": "GPB to USD", "name": "GBPUSD" },
    { "id": 4, "title": "AUD to USD", "name": "AUDUSD" },
    { "id": 5, "title": "USD to CAD", "name": "USDCAD" }
  ]

};

module.exports = config;
