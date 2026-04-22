const express = require("express");
const {
  createHall,
  getHalls,
  getHallsOverview,
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
  .post(auth, isAdmin, validation(createHallSchema), createHall)
  .get(getHalls);

router.get("/overview", getHallsOverview);

router
  .route("/:id")
  .get(validation(hallParamsSchema), getHallById)
  .patch(auth, isAdmin, validation(updateHallSchema), updateHall)
  .delete(auth, isAdmin, validation(hallParamsSchema), deleteHall);

module.exports = router;
