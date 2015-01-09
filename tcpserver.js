var bs = require('./bomscraper');
var _ = require('underscore');

var tcpserver = {};

// Load the TCP Library
net = require('net');

// Start a TCP Server
net.createServer(function (socket) {
  console.log('connection from: '+socket.remoteAddress + ":" + socket.remotePort );
 
  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    var msg = data.toString();
	console.log('message received: '+msg);
	// check if the message is a request
	if (/^req=/.test(msg)) {
		msg = msg.split(/&/); // requests are kind of like a get request, break it up on each key/value pair.
		var req = {};
		console.log(msg);
		_.each(msg,function(r){
			r = r.split(/=/); // break into key/val
			req[r[0]] = r[1];
		})
		console.log(req);
		// check for valid request
		if ('req' in req && 'location' in req);
		bs.fetch(req['req'],req['location'],function(data){tcpserver.basic(socket,req,data);});
	} else console.log('non request received');
  });
}).listen(5000);

// process and send back data for basic weather info
tcpserver.basic = function(socket,req,data) {
	if ('path' in req) {
		var path = req['path'].split(/\./);
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