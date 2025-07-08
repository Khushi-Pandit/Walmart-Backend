const { getShipment, getShipments, createOrder, getProduct, createProduct, getSupplier, createSupplier, getWalmartStore, createWalmartStore, getRouteWeather } = require("../Controller");

const router = require("express").Router();


router.get("/", (req, res) => {
    res.send("Welcome to the Walmart Risk Dashboard Application");
});

router.get('/api/v1/shipments/get_all_shipments', getShipments);
router.get('/api/v1/shipments', getShipment);
router.post('/api/v1/shipments', createOrder);
router.post('/api/v1/weather/get_route_weather', getRouteWeather);
router.get('/api/v1/products', getProduct);
router.post('/api/v1/products', createProduct);
router.get('/api/v1/suppliers', getSupplier);
router.post('/api/v1/suppliers', createSupplier);
router.get('/api/v1/walmartStores', getWalmartStore);
router.post('/api/v1/walmartStores', createWalmartStore);

module.exports = router;