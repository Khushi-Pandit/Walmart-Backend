const {Product} = require('../../Models/index');

const getProductController = async (req, res) => {
    try {
        const products = await Product.find()
            .select('name description price image isPerishable');

        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            data: products
        });
    } catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve products",
            error: error.message
        });
    }
}

module.exports = getProductController;
