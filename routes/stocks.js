var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.CUSTOMCONNSTR_AWSRegion,
  endpoint: process.env.CUSTOMCONNSTR_AWSEndPoint,
  accessKeyId: process.env.CUSTOMCONNSTR_AWSAccessKeyID,
  secretAccessKey: process.env.CUSTOMCONNSTR_AWSSecretAccessKey
});

var docClient = new AWS.DynamoDB.DocumentClient();

/*
var ObjectId = require('mongoose').Types.ObjectId; 
*/

// Create application/json parser
var jsonParser = bodyParser.json({extended: true});

// Get all stocks
router.get('/', function(req, res, next) {
  
  var startTime = new Date((new Date(req.query.date)).toDateString());
  var endTime = new Date(startTime);
  endTime = new Date(endTime.setDate(endTime.getDate()+1));

  var params = {
    TableName: "stocks",
    FilterExpression: "#timestamp between :startTime and :endTime",
    ExpressionAttributeNames: {
      "#timestamp": "timestamp"
    },
    ExpressionAttributeValues: {
      ":startTime": startTime.toISOString(),
      ":endTime": endTime.toISOString(),
    }
  };
  
  docClient.scan(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.Items);
      res.json(data.Items);
    }
  });

  /*
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
  */
  
});

// Insert stock
router.post('/', jsonParser, function(req, res, next) {

  /*
  const MongoClient = require('mongodb').MongoClient;
  const uri = process.env.CUSTOMCONNSTR_DBConnectionString;
  */

  var data = req.body;
  // Append timestamp to the stock data
  data.timestamp = new Date().toISOString();

  var params = {
    TableName:"stocks",
    Item: data
  };

  console.log("AWS - Adding a new item...");

  docClient.put(params, function(err, data) {
      if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("Added item: " + req.body.symbol);
      }
  });
  /*
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
      console.log("Mongo - Document inserted");
    });

    client.close();
  });*/

  res.send("Done");
});

module.exports = router;
/*
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
*/