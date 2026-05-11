const express = require('express');
const { createRestaurantItem, getRestaurantMenu } = require('../controllers/restaurant.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

/** 
 *   1. admin who will update or delete the restaurant items and he can not update it if some of users booked the restaurant items


  
 */

router.get('/menu', auth, getRestaurantMenu);
router.post('/menu', auth, isAdmin, createRestaurantItem);

module.exports = router;
