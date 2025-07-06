const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    isPerishable: { type: Boolean, required: true },
    category: { type: String },
    supplier: {type: mongoose.Schema.ObjectId, ref: "Supplier"}
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;