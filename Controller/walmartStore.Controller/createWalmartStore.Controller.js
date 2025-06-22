const {WalmartStore} = require('../../Models/index');

const createWalmartStore = async (req, res) => {
    try {
        const { name, location } = req.body;

        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const newWalmartStore = new WalmartStore({
            name,
            location,
        });

        await newWalmartStore.save();

        res.status(201).json({
            success: true,
            message: "Walmart store created successfully",
            data: newWalmartStore
        });
    } catch (error) {
        console.error("Error creating Walmart store:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create Walmart store",
            error: error.message
        });
    }
}

module.exports = createWalmartStore;
