const express = require('express');
const { createShowTime, getShowTimes } = require('../controllers/showTime.controller');
const { getSeatsByShowTime, seedSeats } = require('../controllers/seat.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

/**
  1. admin who will update or delete the show time and he can not update it if some of users booked the show time


  2.use zod for the validation
  

 */

router.route('/').post(auth, isAdmin, createShowTime).get(auth, getShowTimes);

router.get('/:showTimeId/seats', auth, getSeatsByShowTime);
router.post('/:showTimeId/seats/seed', auth, isAdmin, seedSeats);

module.exports = router;
