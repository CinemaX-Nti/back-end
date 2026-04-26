const { z } = require("zod");

const signupSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    email: z.string().trim().email(),
    password: z.string().min(6),
    phoneNumber: z
      .string()
      .trim()
      .regex(
        /^(?:\+20|0)?1[0125]\d{8}$/,
        "Invalid Egyptian phone number",
      )
      .optional(),
    dateOfBirth: z.coerce.date().optional(),
  }),
});

const signinSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(6),
  }),
});

const gmailLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(1),
  }),
});

const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }),
});

const updateProfileSchema = z.object({
  body: z
    .object({
      firstName: z.string().trim().min(2).optional(),
      lastName: z.string().trim().min(2).optional(),
      email: z.string().trim().email().optional(),
      phoneNumber: z
        .string()
        .trim()
        .regex(
          /^(?:\+20|0)?1[0125]\d{8}$/,
          "Invalid Egyptian phone number",
        )
        .optional(),
    })
    .refine(
      (data) =>
        data.firstName !== undefined ||
        data.lastName !== undefined ||
        data.email !== undefined ||
        data.phoneNumber !== undefined,
      {
        message:
          "At least one field is required: firstName, lastName, email, or phoneNumber",
      },
    ),
});

const forgetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
  }),
});

const resendPasswordResetOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    otp: z.string().trim().min(4),
    newPassword: z.string().min(6),
  }),
});

const confirmEmailSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    otp: z.string().trim().min(4),
  }),
});

const resendConfirmationOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
  }),
});

const deleteProfileSchema = z.object({
  body: z.object({
    otp: z.string().trim().min(4),
  }),
});

module.exports = {
  signupSchema,
  signinSchema,
  gmailLoginSchema,
  updatePasswordSchema,
  updateProfileSchema,
  forgetPasswordSchema,
  resendPasswordResetOtpSchema,
  resetPasswordSchema,
  confirmEmailSchema,
  resendConfirmationOtpSchema,
  deleteProfileSchema,
};
