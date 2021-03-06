var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var timeout = require('connect-timeout')

var envConfig = require('dotenv').config();

// Load route handlers
var indexRouter = require('./routes/index');
var getStocksRouter = require('./routes/stocks');

var app = express();

// Set body-parser limit
app.use(bodyParser({limit: '5mb'}));

// Set timeout for querying data from AWS
app.use(timeout('600s'));
app.use(haltOnTimedout)

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Register custom route masking node_modules
app.use('/scripts', express.static(path.join(__dirname, 'node_modules')));

// Register route handlers
app.use('/', indexRouter);
app.use('/api/stocks', getStocksRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
