const mongoose = require('mongoose');

const supplierIdSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
});

const SupplierId = mongoose.model('SupplierId', supplierIdSchema);

module.exports = SupplierId;