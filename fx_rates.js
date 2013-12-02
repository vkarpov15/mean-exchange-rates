exports.FxRates = function(key, cron, request, FxSnapshot) {
  var rates = {};

  var refresh = function(callback) {
    console.log("Refreshing exchange rates");
    request('http://openexchangerates.org/api/latest.json?app_id=' + key,
      function(error, response, body) {
        if (error) {
          return callback(error);
        }

        rates = JSON.parse(body).rates;
        
        var snapshot = new FxSnapshot({ rates : rates });
        snapshot.save(function(error, snapshot) {
          // Should never fail
        });

        return callback(null, rates);
      });
  };

  var init = function(callback) {
    // Find the latest snapshot
    FxSnapshot.findOne({}).sort({ time : -1 }).exec(function(error, snapshot) {
      if (error || !snapshot) {
        refresh(callback);
      } else {
        // If data is more than 1 day stale
        if (new Date(snapshot.time).getTime() + 24 * 60 * 60 * 1000 < new Date().getTime()) {
          refresh(callback);
        } else {
          rates = snapshot.rates;

          callback(null, snapshot.rates);
        }
      }
    });
  };

  // Ping daily at 6pm for new rates
  var job = new cron.CronJob('00 00 18 * * 0-6', function() {
    refresh(function(){});
  });
  job.start();

  return {
    refresh : refresh,
    init : init,
    get : function() {
      return rates;
    }
  };
};