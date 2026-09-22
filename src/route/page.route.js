const express = require("express");
const router = express.Router();
const Blog = require("../model/blog.model");
const User = require("../model/user.model");
const { isAuth, isAdmin, isOwnerOrAdmin } = require("../middleware/auth.middleware");
const { blogUpload } = require("../middleware/upload.middleware");
const { updateBlog, deleteBlog } = require("../controller/blog.controller");

// GET /register
router.get("/register", (req, res) => {
  if (req.user) return res.redirect("/dashboard");
  res.render("auth/register");
});

// GET /login
router.get("/login", (req, res) => {
  if (req.user) return res.redirect("/dashboard");
  res.render("auth/login");
});

// GET /dashboard
router.get("/dashboard", isAuth, async (req, res) => {
  try {
    const myBlogs = await Blog.find({ author: req.user._id, isDeleted: false }).sort({
      createdAt: -1,
    });
    res.render("dashboard", { myBlogs });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/blogs");
  }
});

// GET /users  (Admin only)
router.get("/users", isAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.render("users/index", { users });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/dashboard");
  }
});

// GET /blogs
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find({ isDeleted: false })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.render("blogs/index", { blogs });
  } catch (err) {
    req.flash("error", err.message);
    res.render("blogs/index", { blogs: [] });
  }
});

// GET /blogs/create
router.get("/blogs/create", isAuth, (req, res) => {
  res.render("blogs/create");
});

// GET /blogs/edit/:id
router.get("/blogs/edit/:id", isAuth, isOwnerOrAdmin(Blog), (req, res) => {
  res.render("blogs/edit", { blog: req.blog });
});

// POST /blogs/edit/:id  (form method override for PUT)
router.post("/blogs/edit/:id", isAuth, isOwnerOrAdmin(Blog), blogUpload, updateBlog);

// POST /blogs/delete/:id  (form method override for DELETE)
router.post("/blogs/delete/:id", isAuth, isOwnerOrAdmin(Blog), deleteBlog);

// GET /blogs/:id
router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false }).populate(
      "author",
      "name email profileImage"
    );
    if (!blog) {
      req.flash("error", "Blog not found");
      return res.redirect("/blogs");
    }
    res.render("blogs/show", { blog });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/blogs");
  }
});

// POST /users/delete/:id  (Admin: delete user from page)
router.post("/users/delete/:id", isAuth, isAdmin, require("../controller/user.controller").deleteUser);

// GET / → redirect to blogs
router.get("/", (req, res) => res.redirect("/blogs"));

module.exports = router;
