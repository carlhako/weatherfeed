var express = require('express');
var router = express.Router();
var bs = require('../bomscraper');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/forecastDetailed/:state/:location', function(req, res){
	req.params.state = req.params.state.toUpperCase();
	req.params.location = req.params.location.toUpperCase();
	bs.fetch.forecastDetailed(req.params,function(d){ res.json(d) });
});
router.get('/forecast/:state/:location',function(req,res){
	req.params.state = req.params.state.toUpperCase();
	req.params.location = req.params.location.toUpperCase();
	bs.fetch.forecast(req.params,function(d){ res.json(d) });
})

router.get('/debug',function(req,res){
	res.json(bs);
})


module.exports = router;
