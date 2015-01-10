weatherfeed
===========

NodeJS data service using express and a few other modules to provide weather data in json scraped from various weather sites for most places in Australia (680+ locations).

The main for this project is to provide an easy to access data source for an arduino using a ESP8266. This can easily be used tho to provide weather data for anything.

Requests are cached for 1 hour, save hitting the sites scraped repeatedly during testing.

Getting Started
---------------
1. Make sure you have nodejs installed 
2. clone repository "git clone https://github.com/carlhako/weatherfeed"
3. run "npm install" inside the directory you just cloned to
4. run "node app.js" 

Next you need to find your location code. You can obtain this 2 ways. Theres a list in the bomscraper-locations.js or once your nodejs service is running via a http request access http://ip:5001/locations for a html table of all the locations with a link to the basic info API.

Making Requests
---------------
The following request types are supported
 - basic

Example Requests:<BR>
HTTP<BR>
http://192.168.1.8:5001/basic?location=QLD_PT022<BR><BR>
TCP<BR>
basic?location=QLD_PT022

TCP requests have the ability to return a single value. You would normally get an object back with multiple layers of depth. Its easiest to view this object first using a web request to work out your path.
example request for tomorrows forecast.

req=basic&location=QLD_PT022&path=weather.0

This will return tomorrows forecast.

Updates
---------------
01/01/2015 - Updated to support all the locations on the bureau of meteorology website, over 680 locations. Simple html table output of this list to find corresponding code. few other code fixes.

