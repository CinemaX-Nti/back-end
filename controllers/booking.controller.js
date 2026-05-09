const mongoose = require("mongoose");
const { Booking, Seat, ShowTime, RestaurantItem } = require("../models");
const {
  getPaginationParams,
  formatPaginatedResponse,
} = require("../utils/movieHelpers");

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createBooking = async (req, res, next) => {
  try {
    const { userId, showTimeId, foodItems = [] } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      throw createHttpError("A valid userId is required.");
    }

    if (!mongoose.isValidObjectId(showTimeId)) {
      throw createHttpError("A valid showTimeId is required.");
    }

    if (!Array.isArray(req.body.seats)) {
      throw createHttpError("seats must be an array of seat numbers.");
    }

    const invalidSeatValue = req.body.seats.find(
      (seatNumber) =>
        typeof seatNumber !== "string" || seatNumber.trim() === "",
    );

    if (invalidSeatValue !== undefined) {
      throw createHttpError(
        "Each seat must be a non-empty string like A1 or B3.",
      );
    }

    if (!Array.isArray(foodItems)) {
      throw createHttpError("foodItems must be an array.");
    }

    const invalidFoodItem = foodItems.find(
      (item) =>
        !item ||
        !mongoose.isValidObjectId(item.itemId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1,
    );

    if (invalidFoodItem) {
      throw createHttpError(
        "Each food item must include a valid itemId and a quantity of at least 1.",
      );
    }

    const requestedSeats = req.body.seats.map((seatNumber) =>
      seatNumber.trim().toUpperCase(),
    );
    const uniqueSeatNumbers = [...new Set(requestedSeats)];

    if (uniqueSeatNumbers.length === 0) {
      throw createHttpError("At least one seat must be selected.");
    }

    const showTime = await ShowTime.findById(showTimeId)
      .populate("movieId", "title")
      .populate("hallId", "name");

    if (!showTime) {
      throw createHttpError("Showtime not found.", 404);
    }

    if (!showTime.movieId) {
      throw createHttpError("Movie not found for this showtime.", 404);
    }

    if (!showTime.hallId) {
      throw createHttpError("Hall not found for this showtime.", 404);
    }

    const seatDocuments = await Seat.find({
      showTimeId,
      seatNumber: { $in: uniqueSeatNumbers },
    });

    if (seatDocuments.length === 0) {
      throw createHttpError(
        "No seats exist for this showtime yet. Seed the showtime seats first.",
      );
    }

    if (seatDocuments.length !== uniqueSeatNumbers.length) {
      throw createHttpError("One or more selected seats do not exist.");
    }

    const unavailableSeats = seatDocuments
      .filter((seat) => seat.status !== "available")
      .map((seat) => seat.seatNumber);

    if (unavailableSeats.length > 0) {
      throw createHttpError(
        `Selected seats are not available: ${unavailableSeats.join(", ")}.`,
      );
    }

    const ticketTotal = seatDocuments.reduce(
      (sum, seat) => sum + seat.price,
      0,
    );

    const uniqueFoodItemIds = [...new Set(foodItems.map((item) => item.itemId))];
    const menuItems = uniqueFoodItemIds.length > 0
      ? await RestaurantItem.find({
        _id: { $in: uniqueFoodItemIds },
        isAvailable: true,
      }).lean()
      : [];

    if (menuItems.length !== uniqueFoodItemIds.length) {
      throw createHttpError(
        "One or more selected food items do not exist or are unavailable.",
      );
    }

    const menuItemMap = new Map(
      menuItems.map((item) => [item._id.toString(), item]),
    );

    const normalizedFoodItems = foodItems.map(({ itemId, quantity }) => {
      const menuItem = menuItemMap.get(itemId.toString());
      const subtotal = menuItem.price * quantity;

      return {
        itemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        subtotal,
      };
    });

    const foodTotal = normalizedFoodItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    const totalAmount = ticketTotal + foodTotal;

    const booking = await Booking.create({
      userId,
      showTimeId,
      hallId: showTime.hallId._id,
      movieId: showTime.movieId._id,
      filmName: showTime.movieId.title,
      seats: uniqueSeatNumbers,
      foodItems: normalizedFoodItems,
      ticketTotal,
      foodTotal,
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

    const populatedBooking = await Booking.findById(booking._id)
      .populate("userId")
      .populate("hallId")
      .populate("movieId")
      .populate({
        path: "showTimeId",
        populate: ["movieId", "hallId"],
      });

    res.status(201).json(populatedBooking);
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const { skip, limit, page } = getPaginationParams(req.query);
    const {
      userId,
      showTimeId,
      hallId,
      movieId,
      status,
      paymentStatus,
      filmName,
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    if (userId) {
      if (!mongoose.isValidObjectId(userId)) {
        throw createHttpError("Invalid userId query param.");
      }
      filter.userId = userId;
    }

    if (showTimeId) {
      if (!mongoose.isValidObjectId(showTimeId)) {
        throw createHttpError("Invalid showTimeId query param.");
      }
      filter.showTimeId = showTimeId;
    }

    if (hallId) {
      if (!mongoose.isValidObjectId(hallId)) {
        throw createHttpError("Invalid hallId query param.");
      }
      filter.hallId = hallId;
    }

    if (movieId) {
      if (!mongoose.isValidObjectId(movieId)) {
        throw createHttpError("Invalid movieId query param.");
      }
      filter.movieId = movieId;
    }

    if (status) {
      const allowedStatuses = ["pending", "confirmed", "cancelled"];
      if (!allowedStatuses.includes(status)) {
        throw createHttpError("Invalid status query param.");
      }
      filter.status = status;
    }

    if (paymentStatus) {
      const allowedPaymentStatuses = ["pending", "paid", "failed", "refunded"];
      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        throw createHttpError("Invalid paymentStatus query param.");
      }
      filter.paymentStatus = paymentStatus;
    }

    if (filmName?.trim()) {
      filter.filmName = { $regex: filmName.trim(), $options: "i" };
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("userId")
        .populate("hallId")
        .populate("movieId")
        .populate({
          path: "showTimeId",
          populate: ["movieId", "hallId"],
        })
        .sort({ createdAt: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json(formatPaginatedResponse(bookings, total, page, limit));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
};
