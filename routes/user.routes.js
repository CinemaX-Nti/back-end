const express = require("express");
const {
  signup,
  signin,
  loginWithGmail,
  getProfile,
  getUsers,
  updateProfile,
  updatePassword,
  forgetPassword,
  resendPasswordResetOtp,
  resetPassword,
  confirmEmail,
  resendConfirmationOtp,
  requestDeleteProfileOtp,
  deleteProfile,
} = require("../controllers/user.controller");
const { auth, isAdmin } = require("../middleware/auth.middleware");
const { validation } = require("../middleware/validation.middleware");
const {
  signupSchema,
  signinSchema,
  gmailLoginSchema,
  updateProfileSchema,
  updatePasswordSchema,
  forgetPasswordSchema,
  resendPasswordResetOtpSchema,
  resetPasswordSchema,
  confirmEmailSchema,
  resendConfirmationOtpSchema,
  deleteProfileSchema,
} = require("../validations/auth.validation");

const router = express.Router();

router.post("/signup", validation(signupSchema), signup);
router.post("/signin", validation(signinSchema), signin);
router.post("/google", validation(gmailLoginSchema), loginWithGmail);
router.patch("/profile", auth, validation(updateProfileSchema), updateProfile);
router.patch(
  "/update-password",
  auth,
  validation(updatePasswordSchema),
  updatePassword,
);
router.post(
  "/forget-password",
  validation(forgetPasswordSchema),
  forgetPassword,
);
router.post(
  "/resend-password-reset-otp",
  validation(resendPasswordResetOtpSchema),
  resendPasswordResetOtp,
);
router.post("/reset-password", validation(resetPasswordSchema), resetPassword);
router.post("/confirm-email", validation(confirmEmailSchema), confirmEmail);
router.post(
  "/resend-confirmation-otp",
  validation(resendConfirmationOtpSchema),
  resendConfirmationOtp,
);
router.post("/request-delete-profile-otp", auth, requestDeleteProfileOtp);
router.delete(
  "/delete-profile",
  auth,
  validation(deleteProfileSchema),
  deleteProfile,
);
router.get("/profile", auth, getProfile);
router.get("/", auth, isAdmin, getUsers);

module.exports = router;
