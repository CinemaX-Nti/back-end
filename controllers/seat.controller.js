const { Seat } = require('../models');
const { seedSeatsForShowTime } = require('../utils/seedSeats');

const getSeatsByShowTime = async (req, res, next) => {
  try {
    const seats = await Seat.find({ showTimeId: req.params.showTimeId }).sort({
      seatNumber: 1,
    });

    res.status(200).json(seats);
  } catch (error) {
    next(error);
  }
};

const seedSeats = async (req, res, next) => {
  try {
    const seats = await seedSeatsForShowTime(req.params.showTimeId);

    res.status(201).json({
      message: 'Seats created successfully for this showtime',
      totalSeats: seats.length,
      seats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSeatsByShowTime,
  seedSeats,
};
