const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    showTimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShowTime",
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "booked"],
      default: "available",
    },
    type: {
      type: String,
      enum: ["standard", "premium", "vip"],
      default: "standard",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Helps fast filtering when we fetch seats for a showtime by booking state.
seatSchema.index({ showTimeId: 1, status: 1 });

// Prevent duplicate seat numbers inside the same showtime.
seatSchema.index({ showTimeId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model("Seat", seatSchema);
