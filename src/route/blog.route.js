const express = require("express");
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controller/blog.controller");
const { isAuth, isOwnerOrAdmin } = require("../middleware/auth.middleware");
const { blogUpload } = require("../middleware/upload.middleware");
const Blog = require("../model/blog.model");

// POST /api/blogs  (Protected)
router.post("/", isAuth, blogUpload, createBlog);

// GET /api/blogs  (Public)
router.get("/", getAllBlogs);

// GET /api/blogs/:id  (Public)
router.get("/:id", getBlogById);

// PUT /api/blogs/:id  (Protected - owner or admin)
router.put("/:id", isAuth, isOwnerOrAdmin(Blog), blogUpload, updateBlog);

// DELETE /api/blogs/:id  (Protected - owner or admin)
router.delete("/:id", isAuth, isOwnerOrAdmin(Blog), deleteBlog);

module.exports = router;
