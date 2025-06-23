const mongoose = require('mongoose');

const deliveryAgentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    vehicle: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    fcm: {
        type: String,
        required: true
    },
});

const DeliveryAgent = mongoose.model('DeliveryAgent', deliveryAgentSchema);

module.exports = DeliveryAgent;