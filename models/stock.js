const mongoose = require('mongoose');

// TODO: This doesn't include the whole schema yet the querying code still works
const StockSchema = mongoose.Schema({
    symbol: {
        type: String,
        required: true
    },
    financialData: {
        type: Object,
        required: true
    },
    summaryProfile: {
        type: Object,
        required: true
    },
})

module.exports = mongoose.model('Stock', StockSchema);