const {Product} = require('../../Models/index');

const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, isPerishable } = req.body;

        if (!name || !description || !price || !image || isPerishable === undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            image,
            isPerishable
        });

        await newProduct.save();

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: newProduct
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message
        });
    }
}