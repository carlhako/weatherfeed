var bs = require('./bomscraper');
var _ = require('underscore');
var moment = require('moment');

var tcpserver = {};

// Load the TCP Library
net = require('net');

// Start a TCP Server
net.createServer(function (socket) {
  console.log('connection from: '+socket.remoteAddress + ":" + socket.remotePort );
 
  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    var msg = data.toString();
	console.log(moment().format('YYYY-MM-DD HH:mm:ss')+' message received: '+msg);
	
	var req = msg.split(/\//);
	req = _.map(req,function(r){ return r.trim().toUpperCase() });
	console.log(req.length,req);

	if (req.length >= 3){
		switch (req[0]){
			case 'FORECAST':
				bs.fetch.forecast({state:req[1],location:req[2]},function(data){tcpserver.forecast(socket,req,data);});
			break;
			case 'FORECASTDETAILED':
				bs.fetch.forecastDetailed({state:req[1],location:req[2]},function(data){tcpserver.forecast(socket,req,data);});
			break;
		}
	} else { console.log('tcp server error: request not long enough'); }
  });
}).listen(5000);

// process and send back data for basic weather info
tcpserver.forecast = function(socket,req,data) {
	console.log('forecast received');
	if (req.length > 3) {
		var path = req.slice(3)
		path = _.map(path,function(p){ return p.toLowerCase() });
		console.log(path);
		var returnData = data; // make a ref to data top level
		for (var i=0; i<path.length; i++) {
			if (path[i] in returnData) returnData = returnData[path[i]]; // transcend into the data object 1 level at a time
			if (typeof returnData === 'string') { break }
		}
		socket.write(returnData);
		console.log('sent back: '+returnData);
	} else {
		if (typeof data === 'object') { // if the data is an object it needs to be stringified
			console.log('sent back object stringified');
			socket.write(JSON.stringify(data));
		} else if (typeof data === 'string') { // errors will come back as a string
			socket.write(data);
			console.log('sent back: '+data);
		}
	}
}
 
console.log("TCP server running on port 5000\n");