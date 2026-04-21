const mongoose = require("mongoose");

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
      {
        row: {
          type: String, // A, B, C...
          required: true,
          uppercase: true,
          trim: true,
        },
        type: {
          type: String,
          enum: ["standard", "premium", "vip"],
          required: true,
        },
      },
    ],
  },

  {
    timestamps: true,
  },
);

hallSchema.index({ name: 1 }, { unique: true });

hallSchema.path('seatLayout').validate(function validateSeatLayout(value) {
  if (!Array.isArray(value)) {
    return false;
  }

  const uniqueRows = new Set(value.map((seatConfig) => seatConfig.row));
  return uniqueRows.size === value.length;
}, 'Each row can only appear once in seatLayout.');

module.exports = mongoose.model("Hall", hallSchema);
