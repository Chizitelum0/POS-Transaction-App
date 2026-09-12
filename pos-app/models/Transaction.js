const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    cashierName: { type: String, required: true },
    items: [
        {
            name: String,
            price: Number,
            quantity: Number
        }
    ],
    totalAmount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
