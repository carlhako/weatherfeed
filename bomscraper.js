var r = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');

var bs = {};
bs.urls = {
	'townsville7day': 'http://www.bom.gov.au/cgi-bin/NexGenFWS/getSevenDayPrecisForecastForLocation.pl?aac=QLD_PT022',
};

bs.fetch7daybasic = function(cb){
	r(bs.urls.townsville7day, function (error, response, body) {
		$ = cheerio.load(body);
		// convert table into an array of text from inside each td
		var z = $('td').map(function(i, el) {
			return $(this).text();
		}).get()
		
		// now splice it up 
		var returnData = {};
		returnData.weather = z.slice(1,7);
		returnData.mintemp = z.slice(10,16);
		returnData.maxtemp = z.slice(18,25);
		
		// tack on the forecast date
		returnData.date = $('.date').text();
		cb(returnData);
	})
}

module.exports = bs;