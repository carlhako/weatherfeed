var r = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');
var moment = require('moment');

var bs = {};

// store scraped data here
bs.cache = {
	basic: {
		cacheFor: 60*60*1000, // keep data for 60 minutes.
		epoch: 0,
		data: {}
	}
};

bs.fetch = function(req,loc,cb){
	switch (req) {
		case 'basic': 
			if ( !(loc in bs.cache.basic.data) || (loc in bs.cache.basic.data && (moment().valueOf() - bs.cache.basic.epoch[loc])) > bs.cache.basic.cacheFor) {
				r('http://www.bom.gov.au/cgi-bin/NexGenFWS/getSevenDayPrecisForecastForLocation.pl?aac='+loc, function (error, response, body) {
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
					returnData.maxtemp = z.slice(10,16);
					returnData.mintemp = z.slice(18,25);
					
					// tack on the forecast date
					returnData.date = $('.date').text();
					
					// cache the saved data
					bs.cache.basic.data[loc] = returnData;
					bs.cache.basic.epoch[loc] = moment().valueOf();
					
					// run the callback function with the extracted data
					cb(returnData);
					
					console.log('fresh data fetched for '+loc);
				});
			} else { 
				console.log('cache used for '+loc);
				cb(bs.cache.basic.data[loc]); 
			}
		break;
	}
}

module.exports = bs;