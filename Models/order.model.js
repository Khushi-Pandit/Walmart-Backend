const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    walmartStoreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WalmartStore",
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        prodQuantity: {
            type: Number,
            required: true,
            min: 1
        },
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expctedDeliveryDate: {
        type: Date,
        required: true
    },
    delivery_agents_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryAgent"
    }],
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true
    },
    routes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location"
    }],
});