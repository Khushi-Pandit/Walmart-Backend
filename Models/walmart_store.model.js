const mongoose = require('mongoose');

const walmartStoreSchema = new mongoose.Schema({
    storeName: {
        type: String,
        required: true,
        trim: true
    },
    storeLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true,
    },
});

module.exports = mongoose.model('WalmartStore', walmartStoreSchema);