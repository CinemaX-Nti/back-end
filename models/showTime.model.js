const mongoose = require('mongoose');

const showTimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
      required: true,
      index: true,
    },
    time: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ShowTime', showTimeSchema);
