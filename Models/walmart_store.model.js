const mongoose = require('mongoose');

const walmartStoreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true,
    },
});

module.exports = mongoose.model('WalmartStore', walmartStoreSchema);