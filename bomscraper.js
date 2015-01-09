var r = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');
var moment = require('moment');

var bs = {};
bs.urls = {
	'basic': {
		'townsville': 'http://www.bom.gov.au/cgi-bin/NexGenFWS/getSevenDayPrecisForecastForLocation.pl?aac=QLD_PT022',
	}
};

// store scraped data here
bs.cache = {
	basic: {
		cacheFor: 60*60*1000, // keep data for 60 minutes.
		epoch: 0,
		data: {}
	}
};

bs.fetch = function(req,location,cb){
	switch (req) {
		case 'basic': 
			if (bs.cache.basic.data === {} || (moment().valueOf() - bs.cache.basic.epoch) > bs.cache.basic.cacheFor) {
				r(bs.urls.basic[location], function (error, response, body) {
					// create a cheerio object on the fresh data from bom
					$ = cheerio.load(body);
					// convert table into an array of text from inside each td
					var z = $('td').map(function(i, el) {
						return $(this).text();
					}).get()
					
					// all the data is now in a single array
					// cut it up into weather data and temp data.
					var returnData = {};
					returnData.weather = z.slice(1,7);
					returnData.mintemp = z.slice(10,16);
					returnData.maxtemp = z.slice(18,25);
					
					// tack on the forecast date
					returnData.date = $('.date').text();
					
					// cache the saved data
					bs.cache.basic.data = returnData;
					bs.cache.basic.epoch = moment().valueOf();
					
					// run the callback function with the extracted data
					cb(returnData);
					
					console.log('fresh data fetched');
				});
			} else { 
				console.log('cache used');
				cb(bs.cache.basic.data); 
			}
		break;
	}
}

module.exports = bs;