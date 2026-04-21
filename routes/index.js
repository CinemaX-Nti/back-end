const express = require("express");
const userRoutes = require("./user.routes");
const movieRoutes = require("./movie.routes");
const hallRoutes = require("./hall.routes");
const showTimeRoutes = require("./showTime.routes");
const bookingRoutes = require("./booking.routes");
const orderRoutes = require("./order.routes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/movies", movieRoutes);
router.use("/halls", hallRoutes);
router.use("/showtimes", showTimeRoutes);
router.use("/bookings", bookingRoutes);
router.use("/orders", orderRoutes);

module.exports = router;
