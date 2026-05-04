const mongoose = require("mongoose");
const { GENRES } = require("../utils/movieHelpers");

// Movie schema - handles all film data in the cinema system
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
<<<<<<< badr-back-end
      lowercase: true,
=======
      unique: true,
>>>>>>> main
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
  },
  {
    timestamps: true,
  },
);

<<<<<<< badr-back-end
// Indexes for common queries - makes filtering way faster
movieSchema.index({ isDeleted: 1, status: 1 });
movieSchema.index({ isDeleted: 1, genre: 1 });
movieSchema.index({ isDeleted: 1, title: "text", description: "text" });
movieSchema.index({ isDeleted: 1, rating: -1 });
movieSchema.index({ createdBy: 1, isDeleted: 1 });

// Check for duplicate titles before saving (case-insensitive)
// We do this manually instead of unique: true because we need to handle soft deletes
movieSchema.pre("save", async function (next) {
  try {
    // Normalize and trim the title
    this.title = this.title.trim();

    // Build query to find existing movie with same title
    const query = {
      title: this.title,
      isDeleted: false,
    };

    // If updating, exclude current doc from check
    if (this._id) {
      query._id = { $ne: this._id };
    }

    const existingMovie = await mongoose.model("Movie").findOne(query);

    if (existingMovie) {
      const error = new Error("Movie title already exists");
      error.code = 11000;
      throw error;
    }

    next();
  } catch (error) {
    next(error);
  }
});
=======
movieSchema.index({ title: 1, description: 1 }, { unique: true });
>>>>>>> main

module.exports = mongoose.model("Movie", movieSchema);
