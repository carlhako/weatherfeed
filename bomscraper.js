var ftp = require('ftp-get');
var fs = require('fs');
var cheerio = require('cheerio');
var _ = require('underscore');
var moment = require('moment');
var request = require('request');

bs = {
	cache: {
		forecast: {
			epoch: {},
			data: {},
			cacheFor: 60*60*1000, // keep data for 60 minutes.
		},
		forecastDetailed: {
			epoch: {},
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
		forecastDetailedUrl: 'http://www.bom.gov.au/places/@state/@loc/forecast/detailed/'
	}
};

bs.fetch = {};
		// download latest forecast
bs.fetch.forecast = function(params,cb){
	console.log('forecast requested with ',params);
	// decide if cache is to be used
	if ( !(params.state in bs.cache.forecast.data) || (params.state in bs.cache.forecast.data && (moment().valueOf() - bs.cache.forecast.epoch[params.state])) > bs.cache.forecast.cacheFor) {
		console.log('fetching fresh data for: '+params.state);
		ftp.get('ftp://ftp2.bom.gov.au/anon/gen/fwo/'+bs.options.forecastUrls[params.state.toUpperCase()], bs.options.forecastUrls[params.state.toUpperCase()], function (err, res) {
			if (err !== null) console.log('error downloading data');
			else { 
				bs.process.forecast(res,params,function(){bs.fetchFromCache.forecast(params,cb);});
				bs.cache.forecast.epoch[params.state] = moment().valueOf();
			}
		})
	} else { 
		bs.fetchFromCache.forecast(params,cb);
	}
}

bs.fetchFromCache = {};
bs.fetchFromCache.forecast = function(params,cb){
	console.log('cache used for '+params.state);
	if (params.state in bs.cache.forecast.data) {
		if (params.location in bs.cache.forecast.data[params.state]) { cb(bs.cache.forecast.data[params.state][params.location]); }
		else { cb({error: params.location+' not found in '+params.state+' data'}) }
	} else { cb({error: params.state+' data not found'}) }
}

// convert # deliminated file into object of state->location
bs.process = {};
bs.process.forecast = function(file,params,cb){
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
					bs.cache.forecast.data[r[2]][r[1].toUpperCase()] = row; // cache data
				}
			})
			cb();
			bs.cache.forecast.epoch[params.state] = moment().valueOf();
		}
	});	
}

bs.fetch.forecastDetailed = function(params,cb) {
	console.log('detailed forcast data requested', params);
	returnObj = {};
	// decide if fresh data needs to be pulled or use cache
	if (!(params.state in bs.cache.forecastDetailed.epoch)) bs.cache.forecastDetailed.epoch[params.state] = {};
	if (!(params.location in bs.cache.forecastDetailed.epoch[params.state])) bs.cache.forecastDetailed.epoch[params.state][params.location] = 0;
	var useCache = true;
	if ((moment().valueOf()-bs.cache.forecastDetailed.epoch[params.state][params.location]) > bs.cache.forecastDetailed.cacheFor) useCache = false;
	if (useCache === false) {
		var url = bs.options.forecastDetailedUrl;
		url = url.replace(/@loc/,params.location.toLowerCase());
		url = url.replace(/@state/,params.state.toLowerCase());
		request(url,function(err,data){
			console.log('fetching fresh detailed forcast data');
			bs.cache.forecastDetailed.epoch[params.state][params.location] = moment().valueOf();
			if (!(params.state in bs.cache.forecastDetailed.data)) bs.cache.forecastDetailed.data[params.state] = {};
			bs.cache.forecastDetailed.data[params.state][params.location] = data;
			bs.fetchFromCache.forecastDetailed(params,cb);
		})
	} else { bs.fetchFromCache.forecastDetailed(params,cb); }
}

bs.fetchFromCache.forecastDetailed = function(params,cb) {
	console.log('cache reqeuest',params);
	// create cheerio object
	var $ = cheerio.load(bs.cache.forecastDetailed.data[params.state][params.location].body);
	
	// populate json object to be returned. 
	returnObj.rainfall = tableToObj('Rainfall');
	returnObj.temp = tableToObj('Temperatures');
	returnObj['significant weather event'] = tableToObj('Significant Weather');
	returnObj['humidity and wind'] = tableToObj('Humidity & Wind');	
	
	// return json object
	cb(returnObj);
		
	// this function takes in a heading from the webpage and processes the preceding table taking all the values out and into an object
	function tableToObj(tableHeading) {
		var r = {};
		var dates = $('.pointer').map(function(i,val){ return $(this).text() })
		var rainfallValues = $('h3:contains("'+tableHeading+'")').map(function(dateI,tableEl){
			var curDate = dates[dateI];
			var values = $(tableEl).next().find("tr").map(function(index,el){ return $(this).find('td,th').map(function(i,td){ return $(this).text() }) })
			var periods = values.splice(0,1)[0].get();
			r[curDate] = {};
			_.each(values,function(v){
				v = v.get();
				r[curDate][v[0]] = {};
				_.each(v,function(val,i){
					if (i>0){
						r[curDate][v[0]][periods[i]] = val;
					}
				})
			})
		})
		return r;
	}
}


module.exports = bs;