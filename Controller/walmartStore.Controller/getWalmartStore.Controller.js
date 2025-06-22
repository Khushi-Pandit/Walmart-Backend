const {WalmartStore} = require('../../Models/index');

const getWalmartStore = async (req, res) => {
    try {
        const walmartStores = await WalmartStore.find().populate('location', 'city state latitude longitude postalCode');

        if (!walmartStores || walmartStores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Walmart stores found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Walmart stores retrieved successfully",
            data: walmartStores
        });
    } catch (error) {
        console.error("Error retrieving Walmart stores:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve Walmart stores",
            error: error.message
        });
    }
}

module.exports = getWalmartStore;
