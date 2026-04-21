const { Seat } = require("../models");

const getAvailableSeatCountsByShowTimeIds = async (showTimeIds) => {
  if (!Array.isArray(showTimeIds) || showTimeIds.length === 0) {
    return new Map();
  }

  const seatCounts = await Seat.aggregate([
    {
      $match: {
        showTimeId: { $in: showTimeIds },
        status: "available",
      },
    },
    {
      $group: {
        _id: "$showTimeId",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    seatCounts.map((seatCount) => [seatCount._id.toString(), seatCount.count]),
  );
};

const attachAvailableSeatCounts = async (showTimes) => {
  const showTimeList = Array.isArray(showTimes) ? showTimes : [showTimes];
  const showTimeIds = showTimeList
    .filter(Boolean)
    .map((showTime) => showTime._id);
  const availableSeatCounts = await getAvailableSeatCountsByShowTimeIds(showTimeIds);

  return showTimeList.map((showTime) => {
    if (!showTime) {
      return showTime;
    }

    const availableSeats =
      availableSeatCounts.get(showTime._id.toString()) || 0;

    const showTimeObject =
      typeof showTime.toObject === "function" ? showTime.toObject() : showTime;

    return {
      ...showTimeObject,
      availableSeats,
    };
  });
};

module.exports = {
  attachAvailableSeatCounts,
  getAvailableSeatCountsByShowTimeIds,
};
