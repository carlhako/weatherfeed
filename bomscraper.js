var ftp = require('ftp-get');
var fs = require('fs');
//var cheerio = require('cheerio');
var _ = require('underscore');
var moment = require('moment');

var bs = {};

// store scraped data here
bs.cache = {
	opt: {
		cacheFor: 60*60*1000, // keep data for 60 minutes.
		urls: { // as listed from here http://www.bom.gov.au/info/precis_forecasts.shtml
			//NATIONAL: 'IDA00001.dat', // this loads each state into its own object, state still required in request so might as well stick with state required.
			NSW: 'IDA00002.dat',
			VIC: 'IDA00003.dat',
			QLD: 'IDA00004.dat',
			SA: 'IDA00005.dat',
			WA: 'IDA00006.dat',
			Tas: 'IDA00007.dat',
			NT: 'IDA00008.dat'			
		}
	},
	epoch: 0,
	data: {}
};

bs.fetch = function(state,loc,cb){
	if ( !(state in bs.cache.data) || (state in bs.cache.data && (moment().valueOf() - bs.cache.epoch[state])) > bs.cache.opt.cacheFor) {
		console.log('fetching fresh data for: '+state);
		// download latest forecast
		ftp.get('ftp://ftp2.bom.gov.au/anon/gen/fwo/'+bs.cache.opt.urls[state], bs.cache.opt.urls[state], function (err, res) {
			if (err !== null) console.log('error downloading data');
			else { 
				bs.process(res,state,loc,function(){bs.fetchFromCache(state,loc,cb);}); 
			}
		})
	} else { 
		bs.fetchFromCache(state,loc,cb);
	}
}

bs.fetchFromCache = function(state,loc,cb){
	console.log('cache used for '+state);
	if (state in bs.cache.data) {
		if (loc in bs.cache.data[state]) { cb(bs.cache.data[state][loc]); }
		else { cb({error: loc+'not found in '+state+' data'}) }
	} else { cb({error: state+' data not found'}) }
}

// convery # deliminated file into object of state->location
bs.process = function(file,state,loc,cb){
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
					if (!(r[2] in bs.cache.data)) bs.cache.data[r[2]] = {};
					var row = {};
					_.each(r,function(v,i){ 
						if (header[i] != "") row[header[i]] = v;
					})
					bs.cache.data[r[2]][r[1]] = row; // cache data
				}
			})
			cb();
			bs.cache.epoch[state] = moment().valueOf();
		}
	});	
}

module.exports = bs;