const { Hall, ShowTime, Seat } = require("../models");

const getRowLabel = (rowIndex) => {
  let label = "";
  let current = rowIndex + 1;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    current = Math.floor((current - 1) / 26);
  }

  return label;
};

const buildSeatNumbers = (rows, cols) => {
  const seats = [];

  for (let row = 0; row < rows; row += 1) {
    const rowLabel = getRowLabel(row);

    for (let col = 1; col <= cols; col += 1) {
      seats.push(`${rowLabel}${col}`);
    }
  }

  return seats;
};

const buildSeatTypeMap = (seatLayout) =>
  new Map(
    (seatLayout || []).map((seatConfig) => [
      seatConfig.row.toUpperCase(),
      seatConfig.type,
    ]),
  );

const seedSeatsForShowTime = async (showTimeId) => {
  const showTime = await ShowTime.findById(showTimeId).lean();
  console.log(showTime);

  if (!showTime) {
    throw new Error("ShowTime not found.");
  }

  const hall = await Hall.findById(showTime.hallId).lean();
  console.log(hall);

  if (!hall) {
    throw new Error("Hall not found for this showtime.");
  }

  const existingSeatsCount = await Seat.countDocuments({ showTimeId });

  if (existingSeatsCount > 0) {
    throw new Error("Seats already exist for this showtime.");
  }

  const seatNumbers = buildSeatNumbers(hall.rows, hall.cols);
  const seatTypeMap = buildSeatTypeMap(hall.seatLayout);

  const seatDocuments = seatNumbers.map((seatNumber) => ({
    showTimeId,
    seatNumber,
    status: "available",
    type: seatTypeMap.get(seatNumber.match(/^[A-Z]+/)[0]) || "standard",
    price:
      showTime.pricing[
        seatTypeMap.get(seatNumber.match(/^[A-Z]+/)[0]) || "standard"
      ],
  }));

  const createdSeats = await Seat.insertMany(seatDocuments);

  await ShowTime.findByIdAndUpdate(showTimeId, {
    availableSeats: createdSeats.length,
  });

  return createdSeats;
};

module.exports = {
  buildSeatNumbers,
  seedSeatsForShowTime,
};
