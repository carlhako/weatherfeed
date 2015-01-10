var express = require('express');
var router = express.Router();
var bs = require('../bomscraper');
var bslocs = require ('../bomscraper-locations');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/basic',function(req,res){
	bs.fetch('basic',req.param('location'),function(d){ res.json(d) });
})

router.get('/locations',function(req,res){
	res.send(bslocs.displayLocations());
})

module.exports = router;
