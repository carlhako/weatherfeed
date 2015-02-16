var ftp = require('ftp-get');
var fs = require('fs');
var cheerio = require('cheerio');
var _ = require('underscore');
var moment = require('moment');
var request = require('request');

bs = {
	cache: {
		forecast: {
			epoch: 0,
			data: {},
			cacheFor: 60*60*1000, // keep data for 60 minutes.
		},
		forecastDetails: {
			epoch: 0,
			data: {},
			cacheFor: 60*60*1000, // keep data for 60 minutes.
		},
	},
	options: {
		forecastUrls: { // as listed from here http://www.bom.gov.au/info/precis_forecasts.shtml
			//NATIONAL: 'IDA00001.dat', // this loads each state into its own object, state still required in request so might as well stick with state required.
			NSW: 'IDA00002.dat',
			VIC: 'IDA00003.dat',
			QLD: 'IDA00004.dat',
			SA: 'IDA00005.dat',
			WA: 'IDA00006.dat',
			Tas: 'IDA00007.dat',
			NT: 'IDA00008.dat'			
		},
		forecastDetailedUrl: 'http://www.bom.gov.au/places/qld/townsville/forecast/detailed/'
	}
};

bs.fetch = {};
bs.fetch.forecast = function(state,loc,cb){
	if ( !(state in bs.cache.forecast.data) || (state in bs.cache.forecast.data && (moment().valueOf() - bs.cache.forecast.epoch[state])) > bs.cache.forecast.cacheFor) {
		console.log('fetching fresh data for: '+state);
		// download latest forecast
		ftp.get('ftp://ftp2.bom.gov.au/anon/gen/fwo/'+bs.options.forecastUrls[state], bs.options.forecastUrls[state], function (err, res) {
			if (err !== null) console.log('error downloading data');
			else { 
				bs.process.forecast(res,state,loc,function(){bs.fetchFromCache.forecast(state,loc,cb);}); 
			}
		})
	} else { 
		bs.fetchFromCache.forecast(state,loc,cb);
	}
}

bs.fetchFromCache = {};
bs.fetchFromCache.forecast = function(state,loc,cb){
	console.log('cache used for '+state);
	if (state in bs.cache.forecast.data) {
		if (loc in bs.cache.forecast.data[state]) { cb(bs.cache.forecast.data[state][loc]); }
		else { cb({error: loc+'not found in '+state+' data'}) }
	} else { cb({error: state+' data not found'}) }
}

// convery # deliminated file into object of state->location
bs.process = {};
bs.process.forecast = function(file,state,loc,cb){
	fs.readFile(file, 'utf8', function (err, data) {
		if (err) console.log('error reading '+file);
		else {
			var rows = data.split(/\n/);
			var header = rows[0];
			rows = rows.splice(1); // drop header
			header = header.split('#');
			_.each(rows,function(r){ // loop though each location converting the array into an object of val -> reading
				r = r.split(/#/);
				if (r.length == 31) {
					if (!(r[2] in bs.cache.forecast.data)) bs.cache.forecast.data[r[2]] = {};
					var row = {};
					_.each(r,function(v,i){ 
						if (header[i] != "") row[header[i]] = v;
					})
					bs.cache.forecast.data[r[2]][r[1]] = row; // cache data
				}
			})
			cb();
			bs.cache.forecast.epoch[state] = moment().valueOf();
		}
	});	
}

bs.fetch.forecastDetailed = function(cb) {
	request(bs.options.forecastDetailedUrl,function(err,data){
		var $ = cheerio.load(data.body)
		// capture rainfall
		var rainfallPeriods = $('h3:contains("Rainfall")').eq(0).next().find("tr").eq(0).find("th").map(function(index,el){ return $(this).text() }).get()
		
		var rainfallValues = $('h3:contains("Rainfall")').eq(0).next().find("tr").map(function(index,el){ return $(this).find('td,th').map(function(i,td){ return $(this).text() }).get() }).get();
		console.log(rainfallValues);
		
		
		cb([rainfallPeriods,rainfallValues]);
		
	})
}

module.exports = bs;