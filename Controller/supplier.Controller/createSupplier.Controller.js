const {Supplier} = require('../../Models/index');

const createSupplierController = async (req, res) => {
    try {
        const { name, contact, address, location, fcm } = req.body;

        if (!name || !contact || !address || !location) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const newSupplier = new Supplier({
            name,
            contact,
            address,
            location,
            fcm: fcm || null
        });

        await newSupplier.save();

        res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: newSupplier
        });
    } catch (error) {
        console.error("Error creating supplier:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create supplier",
            error: error.message
        });
    }
}

module.exports = createSupplierController;
