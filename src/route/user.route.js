const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser } = require("../controller/user.controller");
const { isAuth, isAdmin } = require("../middleware/auth.middleware");

// GET /api/users  (Admin only)
router.get("/", isAuth, isAdmin, getAllUsers);

// DELETE /api/users/:id  (Admin only)
router.delete("/:id", isAuth, isAdmin, deleteUser);

module.exports = router;
