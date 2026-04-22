const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { User } = require("../models");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "ay 7aga",
    { expiresIn: "1d" },
  );
};

const signup = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, dateOfBirth } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      dateOfBirth,
      confirmed: true,
      provider: "local",
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginWithGmail = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message: "GOOGLE_CLIENT_ID is not configured",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const email = payload.email;
    const fullName = [payload.given_name, payload.family_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(randomPassword, 8);

      user = await User.create({
        name: fullName || payload.name || "Google User",
        email,
        password: hashedPassword,
        confirmed: true,
        provider: "google",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Success",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
  loginWithGmail,
  getProfile,
  getUsers,
};
