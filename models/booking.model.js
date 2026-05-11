const mongoose = require("mongoose");

const bookingFoodItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantItem",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    showTimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShowTime',
      required: true,
      index: true,
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
      required: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    filmName: {
      type: String,
      required: true,
      trim: true,
    },
    seats: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one seat must be selected.",
      },
    },
    foodItems: {
      type: [bookingFoodItemSchema],
      default: [],
    },
    ticketTotal: {
      type: Number,
      min: 0,
      default: 0,
    },
    foodTotal: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "expired"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: [
        "waiting_transfer",
        "waiting_approval",
        "paid",
        "failed",
        "refunded",
      ],
      default: "waiting_transfer",
    },
    paymentReference: {
      type: String,
      trim: true,
      default: null,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    qrCodeDataUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ status: 1, expiresAt: 1 });
bookingSchema.index({ paymentStatus: 1, createdAt: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
