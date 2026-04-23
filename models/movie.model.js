const mongoose = require("mongoose");
const { GENRES } = require("../utils/movieHelpers");

const movieSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
      enum: GENRES,
    },
    language: {
      type: String,
      minLength: 2,
      maxLength: 15,
      trim: true,
    },
    releaseDate: Date,
    trailerUrl: String,
    posterUrl: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    status: {
      type: String,
      enum: ["now_showing", "coming_soon", "archived"],
      default: "coming_soon",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

movieSchema.index({ title: 1, description: 1 }, { unique: true });

module.exports = mongoose.model("Movie", movieSchema);
