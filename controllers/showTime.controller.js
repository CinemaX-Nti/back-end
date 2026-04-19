const { ShowTime } = require('../models');

const createShowTime = async (req, res, next) => {
  try {
    const showTime = await ShowTime.create(req.body);
    res.status(201).json(showTime);
  } catch (error) {
    next(error);
  }
};

const getShowTimes = async (req, res, next) => {
  try {
    const showTimes = await ShowTime.find()
      .populate('movieId')
      .populate('hallId')
      .sort({ time: 1 });

    res.status(200).json(showTimes);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShowTime,
  getShowTimes,
};
