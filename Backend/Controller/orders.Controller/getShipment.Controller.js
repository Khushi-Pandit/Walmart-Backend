const { Shipment } = require('../../Models/index');

const getShipment = async (req, res) => {
  try {
    const {shipment} = req.query;
    const shipments = await Shipment.findById(shipment)
      .populate('walmartStoreId', 'name location')
      .populate('supplierId', 'name contact address location')
      .populate('products.productId', 'name category isPerishable')
      .populate('deliveryAgents', 'name contact vehicle email fcm');

    res.status(200).json({
      success: true,
      message: 'Shipment retrieved successfully',
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

module.exports = getShipment;
