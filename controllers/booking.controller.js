const mongoose = require("mongoose");
const { Booking, Seat, ShowTime } = require("../models");

const createBadRequestError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const createBooking = async (req, res, next) => {
  try {
    const { userId, showTimeId } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      throw createBadRequestError("A valid userId is required.");
    }

    if (!mongoose.isValidObjectId(showTimeId)) {
      throw createBadRequestError("A valid showTimeId is required.");
    }

    if (!Array.isArray(req.body.seats)) {
      throw createBadRequestError("seats must be an array of seat numbers.");
    }

    const invalidSeatValue = req.body.seats.find(
      (seatNumber) => typeof seatNumber !== "string" || seatNumber.trim() === "",
    );

    if (invalidSeatValue !== undefined) {
      throw createBadRequestError(
        "Each seat must be a non-empty string like A1 or B3.",
      );
    }

    const requestedSeats = req.body.seats.map((seatNumber) =>
      seatNumber.trim().toUpperCase(),
    );
    const uniqueSeatNumbers = [...new Set(requestedSeats)];

    if (uniqueSeatNumbers.length === 0) {
      throw createBadRequestError("At least one seat must be selected.");
    }

    const showTime = await ShowTime.findById(showTimeId).select("_id");

    if (!showTime) {
      throw createBadRequestError("Showtime not found.");
    }

    const seatDocuments = await Seat.find({
      showTimeId,
      seatNumber: { $in: uniqueSeatNumbers },
    });

    if (seatDocuments.length === 0) {
      throw createBadRequestError(
        "No seats exist for this showtime yet. Seed the showtime seats first.",
      );
    }

    if (seatDocuments.length !== uniqueSeatNumbers.length) {
      throw createBadRequestError("One or more selected seats do not exist.");
    }

    const unavailableSeats = seatDocuments
      .filter((seat) => seat.status !== "available")
      .map((seat) => seat.seatNumber);

    if (unavailableSeats.length > 0) {
      throw createBadRequestError(
        `Selected seats are not available: ${unavailableSeats.join(", ")}.`,
      );
    }

    const totalAmount = seatDocuments.reduce(
      (sum, seat) => sum + seat.price,
      0,
    );

    const booking = await Booking.create({
      userId,
      showTimeId,
      seats: uniqueSeatNumbers,
      totalAmount,
    });

    await Seat.updateMany(
      {
        showTimeId,
        seatNumber: { $in: uniqueSeatNumbers },
      },
      {
        $set: {
          status: "booked",
        },
      },
    );

    const availableSeats = await Seat.countDocuments({
      showTimeId,
      status: "available",
    });

    await ShowTime.findByIdAndUpdate(showTimeId, {
      availableSeats,
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("userId")
      .populate({
        path: "showTimeId",
        populate: ["movieId", "hallId"],
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
