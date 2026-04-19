const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    showTimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShowTime',
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'booked'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Helps fast filtering when we fetch seats for a showtime by booking state.
seatSchema.index({ showTimeId: 1, status: 1 });

// Prevent duplicate seat numbers inside the same showtime.
seatSchema.index({ showTimeId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
