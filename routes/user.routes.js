const express = require("express");
const {
  signup,
  signin,
  loginWithGmail,
  getProfile,
  getUsers,
} = require("../controllers/user.controller");
const { auth, isAdmin } = require("../middleware/auth.middleware");
const { validation } = require("../middleware/validation.middleware");
const {
  signupSchema,
  signinSchema,
  gmailLoginSchema,
} = require("../validations/auth.validation");

const router = express.Router();

router.post("/signup", validation(signupSchema), signup);
router.post("/signin", validation(signinSchema), signin);
router.post("/google", validation(gmailLoginSchema), loginWithGmail);
router.get("/profile", auth, getProfile);
router.get("/", auth, isAdmin, getUsers);

module.exports = router;
