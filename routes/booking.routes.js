const express = require('express');
const {
  confirmScan,
  createBooking,
  getBookings,
} = require('../controllers/booking.controller');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/confirm-scan/:bookingId', confirmScan);
router.route('/').post(auth, createBooking).get(auth, getBookings);

module.exports = router;
