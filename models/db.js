var mongoose = require('mongoose');

// TODO: Add app config (use dotenv)
// MongoDB
mongoose.connect(process.env.CUSTOMCONNSTR_DBConnectionString, { useNewUrlParser: true});
// Connection success
mongoose.connection.on('connected', () => {
  console.log("MongoDB connected");
});
// Connection failure
mongoose.connection.on('error',(err) => {
  console.log(err);
});

module.exports = mongoose.connection;