var express = require('express');
var router = express.Router();

// Get all stocks
router.get('/', function(req, res, next) {

  const Stocks = require('../models/stock');

  Stocks.find({})
  .then(function(stocks){
    console.log("Data returned from retrieving stocks");
    res.json(stocks);
  })
  .catch(function(error){
    console.log("There was error retrieving stocks" + error);
    res("Error: " + error);
  });
});

module.exports = router;
