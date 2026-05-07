const express = require("express");
const {
  createBooking,
  getBookings,
} = require("../controllers/booking.controller");
const { auth, isAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.route("/").post(auth, isAdmin, createBooking).get(auth, getBookings);

module.exports = router;
