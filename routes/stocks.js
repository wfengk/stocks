var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var ObjectId = require('mongoose').Types.ObjectId; 

// Create application/json parser
var jsonParser = bodyParser.json({extended: true});

// Get all stocks
router.get('/', function(req, res, next) {
  
  const Stocks = require('../models/stock');

  var date = new Date((new Date(req.query.date)).toDateString());
  var dateFilterStart = getObjectIdFromDate(date);
  var dateFilterEnd = getObjectIdFromDate(new Date(date.setDate(date.getDate()+1)));

  Stocks.find({ $and: [ { _id : { $gt : new ObjectId(dateFilterStart) }}, { _id : { $lt : new ObjectId(dateFilterEnd)}}]})
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

    // Clean periods in keys (MongoDB limitation)
    var json = req.body;
    modifyKeys(json);

    const collection = client.db("stocks").collection("stocks");

    collection.insertOne(json, function(err,res) {
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

function modifyKeys(obj){
  Object.keys(obj).forEach(key => {
      if (key.includes(".")) {
        var newKey = key.replace(".","_");
        obj[newKey] = obj[key];
        delete obj[key];
      }
      if (typeof obj[key] === "object" && obj[key] != null){
          modifyKeys(obj[key]);
      }
  });
}

var getObjectIdFromDate = function (date) {
	return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
};
