const { Shipment } = require('../../Models/index');

const getShipmentsController = async (req, res) => {
  try {
    const shipments = await Shipment.find()
      .populate('walmartStoreId', 'name location')
      .populate('supplierId', 'name contact address location')
      .populate('products.productId', 'name category isPerishable')
      .populate('deliveryAgents', 'name contact vehicle email fcm');

    res.status(200).json({
      success: true,
      message: 'Shipments retrieved successfully',
      data: shipments
    });
  } catch (error) {
    console.error('Error retrieving shipments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shipments',
      error: error.message
    });
  }
};

module.exports = getShipmentsController;
