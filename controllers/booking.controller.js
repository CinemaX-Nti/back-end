const { Booking } = require('../models');

const createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId')
      .populate({
        path: 'showTimeId',
        populate: ['movieId', 'hallId'],
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
};
