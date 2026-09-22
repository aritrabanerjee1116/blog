const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

// Attach user to req if token exists (non-blocking)
const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
        res.locals.user = user; // available in all EJS views
      }
    }
  } catch (err) {
    // Invalid token
    res.clearCookie("token");
  }
  next();
};

// Must be logged in
const isAuth = (req, res, next) => {
  if (!req.user) {
    req.flash("error", "Please login to continue");
    return res.redirect("/login");
  }
  next();
};

// Must be admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    req.flash("error", "Access denied. Admins only.");
    return res.redirect("/dashboard");
  }
  next();
};

// Must be blog owner OR admin
const isOwnerOrAdmin = (Blog) => async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      req.flash("error", "Blog not found");
      return res.redirect("/blogs");
    }
    if (
      req.user.role === "admin" ||
      blog.author.toString() === req.user._id.toString()
    ) {
      req.blog = blog; 
      return next();
    }
    req.flash("error", "You are not authorized to perform this action");
    return res.redirect("/blogs");
  } catch (err) {
    req.flash("error", "Something went wrong");
    return res.redirect("/blogs");
  }
};

module.exports = { verifyToken, isAuth, isAdmin, isOwnerOrAdmin };
