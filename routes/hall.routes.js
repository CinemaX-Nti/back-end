const express = require("express");
const {
  createHall,
  getHalls,
  getHallById,
  updateHall,
  deleteHall,
} = require("../controllers/hall.controller");
const { auth, isAdmin } = require("../middleware/auth.middleware");
const { validation } = require("../middleware/validation.middleware");
const {
  hallParamsSchema,
  createHallSchema,
  updateHallSchema,
} = require("../validations/hall.validation");

const router = express.Router();

router
  .route("/")
  .post(
    auth,
    isAdmin,
    validation(createHallSchema),
    createHall,
  )
  .get(auth, getHalls);

router
  .route("/:id")
  .get(auth, validation(hallParamsSchema), getHallById)
  .patch(auth, isAdmin, validation(updateHallSchema), updateHall)
  .delete(auth, isAdmin, validation(hallParamsSchema), deleteHall);

module.exports = router;
