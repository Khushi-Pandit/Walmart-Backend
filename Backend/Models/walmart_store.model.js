const mongoose = require('mongoose');

const walmartStoreSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    address: { type: String },
    country: { type: String, default: 'India' },
});


module.exports = mongoose.model('WalmartStore', walmartStoreSchema);