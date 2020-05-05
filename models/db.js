var mongoose = require('mongoose');

// MongoDB
mongoose.connect(process.env.CUSTOMCONNSTR_DBConnectionString, { useNewUrlParser: true, useUnifiedTopology: true,});
// Connection success
mongoose.connection.on('connected', () => {
  console.log("MongoDB connected");
});
// Connection failure
mongoose.connection.on('error',(err) => {
  console.log(err);
});

module.exports = mongoose.connection;