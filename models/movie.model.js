const mongoose = require("mongoose");

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
      lowercase: true,
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
        message: "At least one genre is required.",
      },
    },
    language: String,
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

module.exports = mongoose.model("Movie", movieSchema);
