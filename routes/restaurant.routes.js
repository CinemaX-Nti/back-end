const express = require("express");
const {
  createRestaurantItem,
  getRestaurantMenu,
} = require("../controllers/restaurant.controller");
const { auth, isAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/menu", auth, getRestaurantMenu);
router.post("/menu", auth, isAdmin, createRestaurantItem);

module.exports = router;
