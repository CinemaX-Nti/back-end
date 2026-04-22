const { z } = require("zod");

const signupSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(3),
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

module.exports = {
  signupSchema,
  signinSchema,
  gmailLoginSchema,
};
