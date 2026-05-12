const express = require("express");
const {
  createRestaurantItem,
  getRestaurantMenu,
  getRestaurantItemById,
  updateRestaurantItem,
  deleteRestaurantItem,
} = require("../controllers/restaurant.controller");
const { auth, isAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// Menu is shared for the single cinema snacks restaurant.
// Anyone authenticated can browse it, while admins manage menu items.

router.get("/menu", auth, getRestaurantMenu);
router.get("/menu/:id", auth, getRestaurantItemById);
router.post("/menu", auth, isAdmin, createRestaurantItem);
router.put("/menu/:id", auth, isAdmin, updateRestaurantItem);
router.delete("/menu/:id", auth, isAdmin, deleteRestaurantItem);

module.exports = router;
