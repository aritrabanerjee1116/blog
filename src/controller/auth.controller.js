const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const User = require("../model/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });


const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "lax",
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/register");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already registered");
      return res.redirect("/register");
    }

    const profileImage = req.file ? req.file.filename : null;

    const user = await User.create({ name, email, password, profileImage });

    const token = signToken(user._id);
    setTokenCookie(res, token);

    req.flash("success", `Welcome, ${user.name}! Registration successful.`);
    res.redirect("/dashboard");
  } catch (err) {
    req.flash("error", err.message || "Registration failed");
    res.redirect("/register");
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Email and password are required");
      return res.redirect("/login");
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    const token = signToken(user._id);
    setTokenCookie(res, token);

    req.flash("success", `Welcome back, ${user.name}!`);
    res.redirect("/dashboard");
  } catch (err) {
    req.flash("error", err.message || "Login failed");
    res.redirect("/login");
  }
};

// GET /api/auth/logout
const logout = (req, res) => {
  res.clearCookie("token");
  req.flash("success", "Logged out successfully");
  res.redirect("/login");
};

module.exports = { register, login, logout };
