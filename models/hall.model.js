const mongoose = require("mongoose");

const seatLayoutGroupSchema = new mongoose.Schema(
  {
    rows: {
      type: [String],
      required: true,
      default: [],
    },
    type: {
      type: String,
      enum: ["standard", "premium", "vip"],
      required: true,
    },
  },
  { _id: false },
);

const hallSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rows: {
      type: Number,
      required: true,
      min: 1,
    },
    cols: {
      type: Number,
      required: true,
      min: 1,
    },
    seatLayout: [
      seatLayoutGroupSchema,
    ],
    availability: {
      type: Boolean,
      required: true,
    },
  },

  {
    timestamps: true,
  },
);

hallSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Hall", hallSchema);
