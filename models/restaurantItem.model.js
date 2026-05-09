const mongoose = require("mongoose");

const restaurantItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "general",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

restaurantItemSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("RestaurantItem", restaurantItemSchema);
