const { ShowTime } = require("../models");
const { attachAvailableSeatCounts } = require("../utils/showTimeAvailability");

const createShowTime = async (req, res, next) => {
  try {
    const { availableSeats, ...showTimeData } = req.body;
    const showTime = await ShowTime.create(showTimeData);
    const [showTimeWithAvailability] = await attachAvailableSeatCounts(showTime);

    res.status(201).json(showTimeWithAvailability);
  } catch (error) {
    next(error);
  }
};

const getShowTimes = async (req, res, next) => {
  try {
    const showTimes = await ShowTime.find()
      .populate("movieId")
      .populate("hallId")
      .sort({ startTime: 1 });
    const showTimesWithAvailability = await attachAvailableSeatCounts(showTimes);

    res.status(200).json(showTimesWithAvailability);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShowTime,
  getShowTimes,
};
