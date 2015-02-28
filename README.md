weatherfeed
===========

NodeJS service providing weather data as JSON or strings. Data is currently scraped from
- BOM API (Australian Weather Forecast)

This code has primarily been written for a project of mine. I have an arduino, ESP8266 and LCD screen which will be displaying this data. This can easily be used tho to provide weather data for anything.

Requests are cached for 1 hour (configurable) and are accessable via tcp or http get requests.

2 types of forecast data can be returned. simple and detailed. Both contain future 7 days but the detailed includes humidity, rain prediction etc.
See examples on how to retreive each.

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
http://192.168.1.8:5001/forecastDetailed/qld/townsville<BR>
http://192.168.1.8:5001/forecast/qld/townsville<BR>
<BR>

TCP<BR>
forecastdetailed/qld/townsville

TCP requests have the ability to return a single value from within the json object. This allows an arduino to fetch a single value without processing the json.
example request for tomorrows forecast.

forecast/qld/townsville/forecast_0

To Do
--------
Change detailed forecast object ot an array type, this will allow the arduino to access detailed forecast.
Scrape warnings and cyclone warning centre data.


Updates
---------------
28/02/2015 - Updated to scrape detailed forecast using cheerio. fixed a few caching issues and updated functions top support the new version of express which dropped req.param() function. 
16/02/2015 - Scrapped most of the previous code where the BOM website was scraped and replaced with data that processes the BOM's provided API. This should future proof the code and is not sensative to UI updated to the website.
10/01/2015 - Updated to support all the locations on the bureau of meteorology website, over 680 locations. Simple html table output of this list to find corresponding code. few other code fixes.
