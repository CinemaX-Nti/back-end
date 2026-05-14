const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { Booking, Seat, ShowTime, RestaurantItem } = require('../models');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/movieHelpers');
const { BOOKING_HOLD_MINUTES, releaseExpiredPendingBookings } = require('../utils/bookingExpiry');

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isRetryableTransactionError = error =>
  error?.errorLabels?.includes('TransientTransactionError') || error?.errorLabels?.includes('UnknownTransactionCommitResult');

const runTransactionWithRetry = async (work, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const session = await mongoose.startSession();

    try {
      let result;

      await session.withTransaction(async () => {
        result = await work(session);
      });

      return result;
    } catch (error) {
      lastError = error;

      if (!isRetryableTransactionError(error) || attempt === maxRetries) {
        throw error;
      }
    } finally {
      await session.endSession();
    }
  }

  throw lastError;
};

const validateAndNormalizeBookingInput = req => {
  const { userId, showTimeId, foodItems = [], paymentReference } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    throw createHttpError('A valid userId is required.');
  }

  if (!mongoose.isValidObjectId(showTimeId)) {
    throw createHttpError('A valid showTimeId is required.');
  }

  if (!Array.isArray(req.body.seats)) {
    throw createHttpError('seats must be an array of seat numbers.');
  }

  const invalidSeatValue = req.body.seats.find(seatNumber => typeof seatNumber !== 'string' || seatNumber.trim() === '');

  if (invalidSeatValue !== undefined) {
    throw createHttpError('Each seat must be a non-empty string like A1 or B3.');
  }

  if (!Array.isArray(foodItems)) {
    throw createHttpError('foodItems must be an array.');
  }

  const invalidFoodItem = foodItems.find(item => !item || !mongoose.isValidObjectId(item.itemId) || !Number.isInteger(item.quantity) || item.quantity < 1);

  if (invalidFoodItem) {
    throw createHttpError('Each food item must include a valid itemId and a quantity of at least 1.');
  }

  const requestedSeats = req.body.seats.map(seatNumber => seatNumber.trim().toUpperCase());
  const uniqueSeatNumbers = [...new Set(requestedSeats)];

  if (uniqueSeatNumbers.length === 0) {
    throw createHttpError('At least one seat must be selected.');
  }

  if (paymentReference !== undefined && (typeof paymentReference !== 'string' || paymentReference.trim() === '')) {
    throw createHttpError('paymentReference must be a non-empty string when provided.');
  }

  return {
    userId,
    showTimeId,
    foodItems,
    paymentReference: paymentReference?.trim() || null,
    uniqueSeatNumbers,
  };
};

const getAdminReviewBookingUrl = bookingId => {
  const baseUrl = process.env.FRONTEND_URL || 'https://your-domain.com';

  return `${baseUrl.replace(/\/+$/, '')}/api/bookings/confirm-scan/${bookingId}`;
};

const createBooking = async (req, res, next) => {
  try {
    const { userId, showTimeId, foodItems, paymentReference, uniqueSeatNumbers } = validateAndNormalizeBookingInput(req);

    await releaseExpiredPendingBookings({ showTimeId });

    const bookingId = new mongoose.Types.ObjectId();
    const expiresAt = new Date(Date.now() + BOOKING_HOLD_MINUTES * 60 * 1000);
    const reviewBookingUrl = getAdminReviewBookingUrl(bookingId.toString());
    const qrCodeDataUrl = await QRCode.toDataURL(reviewBookingUrl);

    const booking = await runTransactionWithRetry(async session => {
      const showTime = await ShowTime.findById(showTimeId).populate('movieId', 'title').populate('hallId', 'name').session(session);

      if (!showTime) {
        throw createHttpError('Showtime not found.', 404);
      }

      if (!showTime.movieId) {
        throw createHttpError('Movie not found for this showtime.', 404);
      }

      if (!showTime.hallId) {
        throw createHttpError('Hall not found for this showtime.', 404);
      }

      const seatDocuments = await Seat.find({
        showTimeId,
        seatNumber: { $in: uniqueSeatNumbers },
      }).session(session);

      if (seatDocuments.length === 0) {
        throw createHttpError('No seats exist for this showtime yet. Seed the showtime seats first.');
      }

      if (seatDocuments.length !== uniqueSeatNumbers.length) {
        throw createHttpError('One or more selected seats do not exist.');
      }

      const lockResult = await Seat.updateMany(
        {
          showTimeId,
          seatNumber: { $in: uniqueSeatNumbers },
          status: 'available',
        },
        {
          $set: {
            status: 'locked',
          },
        },
        { session }
      );

      if (lockResult.modifiedCount !== uniqueSeatNumbers.length) {
        throw createHttpError('One or more selected seats were just booked by another user. Please try again.', 409);
      }

      const ticketTotal = seatDocuments.reduce((sum, seat) => sum + seat.price, 0);

      const uniqueFoodItemIds = [...new Set(foodItems.map(item => item.itemId))];
      const menuItems =
        uniqueFoodItemIds.length > 0
          ? await RestaurantItem.find({
              _id: { $in: uniqueFoodItemIds },
              isAvailable: true,
            })
              .lean()
              .session(session)
          : [];

      if (menuItems.length !== uniqueFoodItemIds.length) {
        throw createHttpError('One or more selected food items do not exist or are unavailable.');
      }

      const menuItemMap = new Map(menuItems.map(item => [item._id.toString(), item]));

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

      const foodTotal = normalizedFoodItems.reduce((sum, item) => sum + item.subtotal, 0);
      const totalAmount = ticketTotal + foodTotal;

      await Booking.create(
        [
          {
            _id: bookingId,
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
            status: 'pending',
            paymentStatus: 'waiting_transfer',
            paymentReference,
            isPaid: false,
            expiresAt,
            qrCodeDataUrl,
          },
        ],
        { session }
      );

      const availableSeats = await Seat.countDocuments({
        showTimeId,
        status: 'available',
      }).session(session);

      await ShowTime.findByIdAndUpdate(
        showTimeId,
        {
          availableSeats,
        },
        { session }
      );

      return bookingId;
    });

    const populatedBooking = await Booking.findById(booking)
      .populate('userId')
      .populate('hallId')
      .populate('movieId')
      .populate({
        path: 'showTimeId',
        populate: ['movieId', 'hallId'],
      });

    res.status(201).json({
      message: 'Booking created successfully. Complete the wallet transfer and wait for admin approval before the hold expires.',
      booking: populatedBooking,
      qrReviewLink: reviewBookingUrl,
      paymentInstructions: {
        walletQrImageUrl: process.env.ADMIN_WALLET_QR_URL || null,
        accountName: process.env.ADMIN_WALLET_ACCOUNT_NAME || null,
        accountNumber: process.env.ADMIN_WALLET_ACCOUNT_NUMBER || null,
        bankName: process.env.ADMIN_WALLET_BANK_NAME || null,
        note: 'Use the booking ID or your payment reference when submitting the transfer.',
      },
      expiresInMinutes: BOOKING_HOLD_MINUTES,
    });
  } catch (error) {
    next(error);
  }
};

const confirmScan = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.isValidObjectId(bookingId)) {
      throw createHttpError('A valid bookingId is required.');
    }

    await releaseExpiredPendingBookings({ bookingId });

    const reviewedBookingId = await runTransactionWithRetry(async session => {
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw createHttpError('Booking not found.', 404);
      }

      if (booking.status === 'expired') {
        throw createHttpError('Booking hold has expired.', 410);
      }

      if (booking.status === 'cancelled') {
        throw createHttpError('Cancelled bookings cannot be submitted for review.', 409);
      }

      if (booking.status === 'confirmed' || booking.paymentStatus === 'paid') {
        throw createHttpError('Booking payment has already been approved.', 409);
      }

      if (booking.expiresAt && booking.expiresAt <= new Date()) {
        throw createHttpError('Booking hold has expired.', 410);
      }

      if (booking.paymentStatus === 'waiting_transfer') {
        booking.paymentStatus = 'waiting_approval';
        await booking.save({ session });
      } else if (booking.paymentStatus !== 'waiting_approval') {
        throw createHttpError('This booking cannot be submitted for admin approval in its current payment state.', 409);
      }

      return booking._id;
    });

    const populatedBooking = await Booking.findById(reviewedBookingId)
      .populate('userId')
      .populate('hallId')
      .populate('movieId')
      .populate({
        path: 'showTimeId',
        populate: ['movieId', 'hallId'],
      });

    res.status(200).json({
      message: 'Payment submitted for review. Please wait for admin confirmation.',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

const approvePayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.isValidObjectId(bookingId)) {
      throw createHttpError('A valid bookingId is required.');
    }

    await releaseExpiredPendingBookings({ bookingId });

    const confirmedBookingId = await runTransactionWithRetry(async session => {
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw createHttpError('Booking not found.', 404);
      }

      if (booking.status === 'confirmed') {
        throw createHttpError('Booking payment is already approved.', 409);
      }

      if (booking.status === 'expired') {
        throw createHttpError('Booking hold has expired.', 410);
      }

      if (booking.status === 'cancelled') {
        throw createHttpError('Cancelled bookings cannot be confirmed.', 409);
      }

      if (!['waiting_transfer', 'waiting_approval'].includes(booking.paymentStatus)) {
        throw createHttpError('Only pending bookings waiting for transfer or admin approval can be approved.', 409);
      }

      if (booking.expiresAt && booking.expiresAt <= new Date()) {
        throw createHttpError('Booking hold has expired.', 410);
      }

      const seatDocuments = await Seat.find({
        showTimeId: booking.showTimeId,
        seatNumber: { $in: booking.seats },
      }).session(session);

      if (seatDocuments.length !== booking.seats.length) {
        throw createHttpError('One or more seats linked to this booking no longer exist.', 409);
      }

      const invalidSeats = seatDocuments.filter(seat => seat.status !== 'locked').map(seat => `${seat.seatNumber} (${seat.status})`);

      if (invalidSeats.length > 0) {
        throw createHttpError(`Booking cannot be confirmed because these seats are no longer locked: ${invalidSeats.join(', ')}.`, 409);
      }

      const seatUpdateResult = await Seat.updateMany(
        {
          showTimeId: booking.showTimeId,
          seatNumber: { $in: booking.seats },
          status: 'locked',
        },
        {
          $set: {
            status: 'booked',
          },
        },
        { session }
      );

      if (seatUpdateResult.modifiedCount !== booking.seats.length) {
        throw createHttpError('Booking confirmation failed because one or more seats changed state.', 409);
      }

      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      booking.isPaid = true;
      booking.confirmedAt = new Date();
      booking.expiresAt = null;
      await booking.save({ session });

      const availableSeats = await Seat.countDocuments({
        showTimeId: booking.showTimeId,
        status: 'available',
      }).session(session);

      await ShowTime.findByIdAndUpdate(
        booking.showTimeId,
        {
          availableSeats,
        },
        { session }
      );

      return booking._id;
    });

    const populatedBooking = await Booking.findById(confirmedBookingId)
      .populate('userId')
      .populate('hallId')
      .populate('movieId')
      .populate({
        path: 'showTimeId',
        populate: ['movieId', 'hallId'],
      });

    res.status(200).json({
      message: 'Payment approved successfully.',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

const getPendingPayments = async (req, res, next) => {
  try {
    const { skip, limit, page } = getPaginationParams(req.query);

    const [bookings, total] = await Promise.all([
      Booking.find({
        status: 'pending',
        paymentStatus: 'waiting_approval',
      })
        .populate('userId')
        .populate('hallId')
        .populate('movieId')
        .populate({
          path: 'showTimeId',
          populate: ['movieId', 'hallId'],
        })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({
        status: 'pending',
        paymentStatus: 'waiting_approval',
      }),
    ]);

    res.status(200).json(formatPaginatedResponse(bookings, total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const { skip, limit, page } = getPaginationParams(req.query);
    const { userId, showTimeId, hallId, movieId, status, paymentStatus, filmName, sortOrder = 'desc' } = req.query;

    const filter = {};

    if (userId) {
      if (!mongoose.isValidObjectId(userId)) {
        throw createHttpError('Invalid userId query param.');
      }
      filter.userId = userId;
    }

    if (showTimeId) {
      if (!mongoose.isValidObjectId(showTimeId)) {
        throw createHttpError('Invalid showTimeId query param.');
      }
      filter.showTimeId = showTimeId;
    }

    if (hallId) {
      if (!mongoose.isValidObjectId(hallId)) {
        throw createHttpError('Invalid hallId query param.');
      }
      filter.hallId = hallId;
    }

    if (movieId) {
      if (!mongoose.isValidObjectId(movieId)) {
        throw createHttpError('Invalid movieId query param.');
      }
      filter.movieId = movieId;
    }

    if (status) {
      const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'expired'];
      if (!allowedStatuses.includes(status)) {
        throw createHttpError('Invalid status query param.');
      }
      filter.status = status;
    }

    if (paymentStatus) {
      const allowedPaymentStatuses = ['waiting_transfer', 'waiting_approval', 'paid', 'failed', 'refunded'];
      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        throw createHttpError('Invalid paymentStatus query param.');
      }
      filter.paymentStatus = paymentStatus;
    }

    if (filmName?.trim()) {
      filter.filmName = { $regex: filmName.trim(), $options: 'i' };
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('userId')
        .populate('hallId')
        .populate('movieId')
        .populate({
          path: 'showTimeId',
          populate: ['movieId', 'hallId'],
        })
        .sort({ createdAt: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json(formatPaginatedResponse(bookings, total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    // Get total confirmed bookings and revenue
    const confirmedBookings = await Booking.find({ status: 'confirmed' });
    const totalBookings = confirmedBookings.length;
    const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    // Get active showtimes (scheduled or running)
    const activeShowtimes = await ShowTime.countDocuments({
      status: { $in: ['scheduled', 'running'] },
    });

    // Get recent bookings (last 5 confirmed)
    const recentBookings = await Booking.find({ status: 'confirmed' })
      .populate('userId', 'name email')
      .populate('hallId', 'name')
      .populate({
        path: 'showTimeId',
        populate: ['movieId'],
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        totalRevenue,
        activeShowtimes,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  approvePayment,
  confirmScan,
  createBooking,
  getPendingPayments,
  getBookings,
  getDashboardStats,
};
