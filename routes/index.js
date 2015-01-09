var express = require('express');
var router = express.Router();
var bs = require('../bomscraper');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/basic',function(req,res){
	bs.fetch('basic',req.param('location'),function(d){ res.json(d) });
})

module.exports = router;
