const express = require('express');
const { createBooking, getBookings } = require('../controllers/booking.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 *
 * 1. update for the users who booked the show time and he can not update it if some of users booked the show time
 */

router.route('/').post(auth, createBooking).get(auth, getBookings);

module.exports = router;
