const mongoose = require("mongoose");
const { ShowTime, Seat, Booking } = require("../models");
const { attachAvailableSeatCounts } = require("../utils/showTimeAvailability");
const { seedSeatsForShowTime } = require("../utils/seedSeats");

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseDateInput = (value, fieldName) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw createHttpError(`${fieldName} must be a valid date.`);
  }

  return parsedDate;
};

const getDateRange = (dateValue) => {
  const parsedDate = parseDateInput(dateValue, "date");
  const startOfDay = new Date(parsedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  return {
    startOfDay,
    endOfDay,
  };
};

const createShowTime = async (req, res, next) => {
  try {
    const { availableSeats, ...showTimeData } = req.body;
    const now = new Date();
    const startTime = parseDateInput(showTimeData.startTime, "startTime");
    const endTime = parseDateInput(showTimeData.endTime, "endTime");

    if (!mongoose.isValidObjectId(showTimeData.movieId)) {
      throw createHttpError("A valid movieId is required.");
    }

    if (!mongoose.isValidObjectId(showTimeData.hallId)) {
      throw createHttpError("A valid hallId is required.");
    }

    if (startTime < now) {
      throw createHttpError("startTime cannot be in the past.");
    }

    if (endTime <= startTime) {
      throw createHttpError("endTime must be strictly after startTime.");
    }

    showTimeData.startTime = startTime;
    showTimeData.endTime = endTime;

    const session = await mongoose.startSession();
    let showTimeId;

    try {
      await session.withTransaction(async () => {
        const overlappingShowTime = await ShowTime.findOne({
          hallId: showTimeData.hallId,
          status: { $ne: "cancelled" },
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        }).session(session);

        if (overlappingShowTime) {
          throw createHttpError(
            "This hall is already occupied during the selected time range.",
            409,
          );
        }

        const [showTime] = await ShowTime.create([showTimeData], { session });
        showTimeId = showTime._id;

        await seedSeatsForShowTime(showTimeId, { session });
      });
    } finally {
      await session.endSession();
    }

    const showTime = await ShowTime.findById(showTimeId)
      .populate("movieId")
      .populate("hallId");
    const [showTimeWithAvailability] = await attachAvailableSeatCounts(showTime);

    res.status(201).json(showTimeWithAvailability);
  } catch (error) {
    next(error);
  }
};

const getShowTimes = async (req, res, next) => {
  try {
    const now = new Date();
    const { movieId, date } = req.query;
    const filter = {
      startTime: { $gte: now },
    };

    if (movieId) {
      if (!mongoose.isValidObjectId(movieId)) {
        throw createHttpError("Invalid movieId query param.");
      }

      filter.movieId = movieId;
    }

    if (date) {
      const { startOfDay, endOfDay } = getDateRange(date);
      filter.startTime = {
        $gte: startOfDay > now ? startOfDay : now,
        $lt: endOfDay,
      };
    }

    const showTimes = await ShowTime.find(filter)
      .populate("movieId")
      .populate("hallId")
      .sort({ startTime: 1 });
    const showTimesWithAvailability = await attachAvailableSeatCounts(showTimes);

    res.status(200).json(showTimesWithAvailability);
  } catch (error) {
    next(error);
  }
};

const deleteShowTime = async (req, res, next) => {
  try {
    const { showTimeId } = req.params;

    if (!mongoose.isValidObjectId(showTimeId)) {
      throw createHttpError("A valid showTimeId is required.");
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const showTime = await ShowTime.findById(showTimeId).session(session);

        if (!showTime) {
          throw createHttpError("ShowTime not found.", 404);
        }

        const confirmedBookingExists = await Booking.exists({
          showTimeId,
          status: "confirmed",
        }).session(session);

        if (confirmedBookingExists) {
          throw createHttpError(
            "This showtime cannot be deleted because it has confirmed bookings.",
            409,
          );
        }

        await Seat.deleteMany({ showTimeId }, { session });

        // Clean up non-confirmed bookings as well so no orphaned booking documents remain.
        await Booking.deleteMany({ showTimeId }, { session });

        await ShowTime.findByIdAndDelete(showTimeId, { session });
      });
    } finally {
      await session.endSession();
    }

    res.status(200).json({
      message: "ShowTime deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShowTime,
  deleteShowTime,
  getShowTimes,
};
