weatherfeed
===========

NodeJS data service using express and a few other modules to provide weather data in json scraped from various weather sites.

The main reason why I am creating this is to provide an easy to access data source for displaying data on an LCD screen using an Arduino and ESP8266. This can also be used for anyhthing that reads JSON.

Getting Started
---------------
1. Make sure you have nodejs installed 
2. clone repository "git clone https://github.com/carlhako/weatherfeed"
3. run "npm install" inside the directory you just cloned to
4. run "node app.js" 

Making Requests
---------------
The following request types are supported
 - basic

Example Requests:
HTTP<BR>
http://192.168.1.8:5001/basic?location=townsville

TCP
basic?location=townsville

TCP requests have the ability to return a string from the object gathered from the data scraping module. You would normally get an object back with multiple layers of depth. Its easiest to view this object first using a web request to work out your path.
example request for tomorrows forecast.

req=basic&location=townsville&path=weather.0

