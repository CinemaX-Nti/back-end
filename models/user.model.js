const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    dateOfBirth: Date,
  },

  {
    timestamps: true,
  },
);

userSchema.set("toJSON", {
  transform: (document, returnedDocument) => {
    delete returnedDocument.password;
    return returnedDocument;
  },
});

module.exports = mongoose.model("User", userSchema);
