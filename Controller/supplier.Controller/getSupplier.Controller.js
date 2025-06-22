const {Supplier} = require('../../Models/index');

const getSupplierController = async (req, res) => {
    try {
        const suppliers = await Supplier.find()
            .populate('location', 'city state latitude longitude postalCode');

        res.status(200).json({
            success: true,
            message: "Suppliers retrieved successfully",
            data: suppliers
        });
    } catch (error) {
        console.error("Error retrieving suppliers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve suppliers",
            error: error.message
        });
    }
}

module.exports = getSupplierController;
