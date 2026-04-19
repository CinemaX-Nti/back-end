const { Order } = require('../models');

const createOrder = async (req, res, next) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'bookingId',
        populate: ['userId', 'showTimeId'],
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
};
