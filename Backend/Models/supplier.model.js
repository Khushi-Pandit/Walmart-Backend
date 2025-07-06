const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  productTypes: [String], // Optional: products they supply
  isPreferred: { type: Boolean, default: false } // Optional flag
});

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
