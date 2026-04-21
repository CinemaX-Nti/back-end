const mongoose = require("mongoose");

const showTimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    pricing: {
      standard: {
        type: Number,
        required: true,
        min: 0,
      },
      premium: {
        type: Number,
        required: true,
        min: 0,
      },
      vip: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    status: {
      type: String,
      enum: ["scheduled", "running", "finished", "cancelled"],
      default: "scheduled",
    },
    format: {
      type: String,
      enum: ["2D", "3D", "IMAX"],
    },
    availableSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

showTimeSchema.pre("validate", function validateShowTimeDates(next) {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    this.invalidate("endTime", "endTime must be later than startTime.");
  }

  next();
});

showTimeSchema.index({ hallId: 1, startTime: 1 });
showTimeSchema.index({ movieId: 1, startTime: 1 });

module.exports = mongoose.model("ShowTime", showTimeSchema);
