var express = require('express');
var router = express.Router();
var bs = require('../bomscraper');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/forecast',function(req,res){
	bs.fetch(req.param('state').toUpperCase(),req.param('location'),function(d){ res.json(d) });
})

router.get('/bs',function(req,res){
	res.json(bs.cache);
})

module.exports = router;
