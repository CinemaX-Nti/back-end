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
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phoneNumber: {
      type: Number,
      required: true,
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
