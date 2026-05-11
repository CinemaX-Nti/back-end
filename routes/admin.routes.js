const express = require("express");
const {
  getPendingPayments,
  approvePayment,
} = require("../controllers/booking.controller");
const { auth, isAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/pending-payments", auth, isAdmin, getPendingPayments);
router.patch("/approve-payment/:bookingId", auth, isAdmin, approvePayment);

module.exports = router;
