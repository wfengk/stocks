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

// Create application/json parser
var jsonParser = bodyParser.json({extended: true});

// Get all stocks
router.get('/', function(req, res, next) {
  
  var startTime = new Date((new Date(req.query.date)).toDateString());

  var queriedData = [];

  try {
    var params = {
      TableName: "stocks",
      KeyConditionExpression: "#timestamp = :startTime",
      ExpressionAttributeNames: {
        "#timestamp": "timestamp"
      },
      ExpressionAttributeValues: {
        ":startTime": startTime.toLocaleDateString()
      }
    }
    
    //docClient.scan(params,onScan);
    docClient.query(params, function(err, data) {
      if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
          console.log("Query succeeded.");
          queriedData = queriedData.concat(data.Items);
          res.json(queriedData);
      }
    });

  } catch (error) {
      console.error(error);
  }
});

// Get stocks for notification
router.get('/gettopmovers', function(req, res, next) {
  res.json("Here are the top moving stocks:");
});

// Insert stock
router.post('/', jsonParser, function(req, res, next) {

  var data = req.body;
  // Append timestamp to the stock data
  data.timestamp = new Date().toLocaleDateString();

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
  
  res.send("Done");
});

module.exports = router;