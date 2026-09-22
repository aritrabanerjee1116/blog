const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controller/auth.controller");
const { profileUpload } = require("../middleware/upload.middleware");
const { isAuth } = require("../middleware/auth.middleware");

// POST /api/auth/register
router.post("/register", profileUpload, register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/logout
router.get("/logout", isAuth, logout);

module.exports = router;
