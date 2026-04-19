const { Hall, ShowTime, Seat } = require('../models');

const getRowLabel = (rowIndex) => {
  let label = '';
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

const seedSeatsForShowTime = async (showTimeId) => {
  const showTime = await ShowTime.findById(showTimeId).lean();

  if (!showTime) {
    throw new Error('ShowTime not found.');
  }

  const hall = await Hall.findById(showTime.hallId).lean();

  if (!hall) {
    throw new Error('Hall not found for this showtime.');
  }

  const existingSeatsCount = await Seat.countDocuments({ showTimeId });

  if (existingSeatsCount > 0) {
    throw new Error('Seats already exist for this showtime.');
  }

  const seatNumbers = buildSeatNumbers(hall.rows, hall.cols);

  const seatDocuments = seatNumbers.map((seatNumber) => ({
    showTimeId,
    seatNumber,
    status: 'available',
  }));

  return Seat.insertMany(seatDocuments);
};

module.exports = {
  buildSeatNumbers,
  seedSeatsForShowTime,
};
