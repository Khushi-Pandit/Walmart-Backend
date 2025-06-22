const { Order } = require('../../Models/index');

const getOrdersController = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'walmartStoreId',
                select: 'name location',
                populate: {
                    path: 'location',
                    select: 'city state latitude longitude postalCode'
                }
            })
            .populate({
                path: 'products.productId',
                select: 'name price isPerishable',
            })
            .populate('delivery_agents_id','name contact vehicle email fcm')
            .populate({
                path: 'supplierId',
                select: 'name contact address location',
                populate: {
                    path: 'location',
                    select: 'city state latitude longitude postalCode'
                }
            })
            .populate('routes','city state latitude longitude postalCode')
            .populate('currentLocation', 'city state latitude longitude postalCode');

        res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            data: orders
        });
    } catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve orders",
            error: error.message
        });
    }
};

module.exports = getOrdersController;
