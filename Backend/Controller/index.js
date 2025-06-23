const getOrder = require('./orders.Controller/getOrders.Controller');
const createOrder = require('./orders.Controller/createOrder.Controller');

const getProduct = require('./product.Controller/getProduct.Controller');
const createProduct = require('./product.Controller/createProduct.Controller');

const getSupplier = require('./supplier.Controller/getSupplier.Controller');
const createSupplier = require('./supplier.Controller/createSupplier.Controller');

const getWalmartStore = require('./walmartStore.Controller/getWalmartStore.Controller');
const createWalmartStore = require('./walmartStore.Controller/createWalmartStore.Controller');

module.exports = {
    getOrder,
    createOrder,
    getProduct,
    createProduct,
    getSupplier,
    createSupplier,
    getWalmartStore,
    createWalmartStore
};