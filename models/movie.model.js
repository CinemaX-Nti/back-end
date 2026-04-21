const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    genre: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one genre is required.',
      },
    },
    language: String,
    releaseDate: Date,
    posterUrl: String,
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'archived'],
      default: 'coming_soon',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Movie", movieSchema);
