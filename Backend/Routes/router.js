const { getOrder, createOrder, getProduct, createProduct, getSupplier, createSupplier, getWalmartStore, createWalmartStore } = require("../Controller");

const router = require("express").Router();


router.get("/", (req, res) => {
    res.send("Welcome to the API");
});

router.get('/v1/api/orders', getOrder);
router.post('/v1/api/orders', createOrder);
router.get('/v1/api/products', getProduct);
router.post('/v1/api/products', createProduct);
router.get('/v1/api/suppliers', getSupplier);
router.post('/v1/api/suppliers', createSupplier);
router.get('/v1/api/walmartStores', getWalmartStore);
router.post('/v1/api/walmartStores', createWalmartStore);

module.exports = router;