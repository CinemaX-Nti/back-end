const mongoose = require("mongoose");
const { Booking, Seat, ShowTime } = require("../models");

const parsedHoldMinutes = Number(process.env.BOOKING_HOLD_MINUTES);
const BOOKING_HOLD_MINUTES =
  Number.isFinite(parsedHoldMinutes) && parsedHoldMinutes >= 15 && parsedHoldMinutes <= 30
    ? parsedHoldMinutes
    : 15;
const BOOKING_EXPIRY_CHECK_INTERVAL_MS = 60 * 1000;

const toObjectId = (value) => {
  if (!value || !mongoose.isValidObjectId(value)) {
    return null;
  }

  return new mongoose.Types.ObjectId(value);
};

const buildExpiredBookingFilter = (filters = {}) => {
  const filter = {
    status: "pending",
    expiresAt: { $lte: new Date() },
  };

  const bookingId = toObjectId(filters.bookingId);
  const showTimeId = toObjectId(filters.showTimeId);

  if (bookingId) {
    filter._id = bookingId;
  }

  if (showTimeId) {
    filter.showTimeId = showTimeId;
  }

  return filter;
};

const updateShowTimeAvailability = async (showTimeIds, session) => {
  const uniqueShowTimeIds = [...new Set(showTimeIds.map((id) => id.toString()))];

  await Promise.all(
    uniqueShowTimeIds.map(async (showTimeId) => {
      const availableSeats = await Seat.countDocuments({
        showTimeId,
        status: "available",
      }).session(session);

      await ShowTime.findByIdAndUpdate(
        showTimeId,
        {
          availableSeats,
        },
        { session },
      );
    }),
  );
};

const releaseExpiredPendingBookings = async (filters = {}) => {
  const session = await mongoose.startSession();

  try {
    let releasedBookings = [];

    await session.withTransaction(async () => {
      releasedBookings = await Booking.find(buildExpiredBookingFilter(filters))
        .session(session)
        .lean();

      if (releasedBookings.length === 0) {
        return;
      }

      for (const booking of releasedBookings) {
        await Seat.updateMany(
          {
            showTimeId: booking.showTimeId,
            seatNumber: { $in: booking.seats },
            status: "locked",
          },
          {
            $set: {
              status: "available",
            },
          },
          { session },
        );
      }

      await Booking.updateMany(
        {
          _id: { $in: releasedBookings.map((booking) => booking._id) },
          status: "pending",
        },
        {
          $set: {
            status: "expired",
            paymentStatus: "failed",
          },
        },
        { session },
      );

      await updateShowTimeAvailability(
        releasedBookings.map((booking) => booking.showTimeId),
        session,
      );
    });

    return releasedBookings.length;
  } finally {
    await session.endSession();
  }
};

const startBookingExpiryWorker = () => {
  const timer = setInterval(() => {
    releaseExpiredPendingBookings().catch((error) => {
      console.error("Failed to release expired bookings:", error.message);
    });
  }, BOOKING_EXPIRY_CHECK_INTERVAL_MS);

  if (typeof timer.unref === "function") {
    timer.unref();
  }

  return () => clearInterval(timer);
};

module.exports = {
  BOOKING_HOLD_MINUTES,
  BOOKING_EXPIRY_CHECK_INTERVAL_MS,
  releaseExpiredPendingBookings,
  startBookingExpiryWorker,
};
