const mongoose = require('mongoose');

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hall', hallSchema);
