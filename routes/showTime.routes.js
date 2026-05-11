const express = require('express');
const { createShowTime, getShowTimes } = require('../controllers/showTime.controller');
const { getSeatsByShowTime, seedSeats } = require('../controllers/seat.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/').post(createShowTime).get(getShowTimes);
router.get('/:showTimeId/seats', getSeatsByShowTime);
router.post('/:showTimeId/seats/seed', seedSeats);

module.exports = router;
