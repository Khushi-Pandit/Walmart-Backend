const {Order} = require('../../Models/index');

const createOrderController = async (req, res) => {
    try {
        const {walmartStoreId, products, totalAmount, status, expctedDeliveryDate, delivery_agents_id, supplierId, routes, currentLocation} = req.body;

        if (!walmartStoreId || !products || !totalAmount || !expctedDeliveryDate || !supplierId || !currentLocation) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const newOrder = new Order({
            walmartStoreId,
            products,
            totalAmount,
            expctedDeliveryDate,
            delivery_agents_id,
            supplierId,
            routes,
            currentLocation
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: newOrder
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message
        });
    }
}

module.exports = createOrderController;
