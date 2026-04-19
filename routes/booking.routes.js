const express = require('express');
const {
  createBooking,
  getBookings,
} = require('../controllers/booking.controller');

const router = express.Router();

router.route('/').post(createBooking).get(getBookings);

module.exports = router;
