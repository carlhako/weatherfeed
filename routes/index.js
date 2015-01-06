var express = require('express');
var router = express.Router();
var bs = require('../bomscraper');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/7day',function(req,res){
	bs.fetch7day(function(d){ res.json(d) });
})

module.exports = router;
