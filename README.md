weatherfeed
===========

NodeJS service providing weather data as JSON or strings. Data is currently scraped from
- BOM API (Australian Weather Forecast)

This code has primarily been written for a project of mine. I have an arduino, ESP8266 and LCD screen which will be displaying this data. This can easily be used tho to provide weather data for anything.

Requests are cached for 1 hour, save hitting the sites scraped repeatedly during testing.

Getting Started
---------------
1. Make sure you have nodejs installed 
2. clone repository "git clone https://github.com/carlhako/weatherfeed"
3. run "npm install" inside the directory you just cloned to
4. run "node app.js" 

Making Requests
---------------
Example Requests:<BR>
HTTP<BR>
http://192.168.1.8:5001/state=qld&location=Townsville<BR><BR>

TCP<BR>
state=qld&location=Townsville

TCP requests have the ability to return a single value from within the object that is normally returned via the http method.
example request for tomorrows forecast.

state=qld&location=Townsville&path=weather.0

This will return tomorrows forecast.

Updates
---------------
16/02/2015 - Scrapped most of the previous code where the BOM website was scraped and replaced with data that processes the BOM's provided API. This should future proof the code and is not sensative to UI updated to the website.
10/01/2015 - Updated to support all the locations on the bureau of meteorology website, over 680 locations. Simple html table output of this list to find corresponding code. few other code fixes.
