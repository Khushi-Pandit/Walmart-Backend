const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  walmartStoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WalmartStore",
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      prodQuantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["Pending", "Packed", "Dispatched", "In-Transit", "Delayed", "Delivered", "Cancelled"],
    default: "Pending"
  },
  currentLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  deliveryAgents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAgent"
    }
  ],
  expectedDeliveryDate: {
    type: Date,
    required: true
  },
  actualDeliveryDate: {
    type: Date
  },
  isColdChainRequired: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});


const Shipment = mongoose.model("Shipment", shipmentSchema);
module.exports = Shipment;