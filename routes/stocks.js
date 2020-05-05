var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')

// Create application/json parser
var jsonParser = bodyParser.json()

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
    res.send("Error: " + error);
  });
});

// Insert stock
router.post('/', jsonParser, function(req, res, next) {

  const MongoClient = require('mongodb').MongoClient;
  const uri = process.env.CUSTOMCONNSTR_DBConnectionString;
  const client = new MongoClient(uri, { useNewUrlParser: true, newUnifiedTopology: true });
  client.connect(err => {

    const collection = client.db("stocks").collection("stocks");

    collection.insertOne(req.body, function(err,res) {
      if (err) {
        throw err;
      }
      console.log("Document inserted");
    });

    client.close();
  });

  res.send("Done");
});

module.exports = router;
