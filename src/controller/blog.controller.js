const fs = require("fs");
const path = require("path");
const Blog = require("../model/blog.model");

// Helper to unlink image
const unlinkImage = (filename) => {
  if (!filename) return;
  const imgPath = path.join(__dirname, "../../public/uploads", filename);
  if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
};

// POST /api/blogs  (Protected)
const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      req.flash("error", "Title and content are required");
      return res.redirect("/blogs/create");
    }

    const image = req.file ? req.file.filename : null;

    await Blog.create({ title, content, image, author: req.user._id });

    req.flash("success", "Blog created successfully!");
    res.redirect("/blogs");
  } catch (err) {
    req.flash("error", err.message || "Failed to create blog");
    res.redirect("/blogs/create");
  }
};

// GET /api/blogs  (Public)
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isDeleted: false })
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: blogs.length, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/blogs/:id  (Public)
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false }).populate(
      "author",
      "name email profileImage"
    );
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/blogs/:id  (Protected - owner or admin)
const updateBlog = async (req, res) => {
  try {
    const blog = req.blog; // attached by isOwnerOrAdmin middleware
    const { title, content } = req.body;

    if (title) blog.title = title;
    if (content) blog.content = content;

    // Replace image if new one uploaded
    if (req.file) {
      unlinkImage(blog.image);
      blog.image = req.file.filename;
    }

    await blog.save();

    req.flash("success", "Blog updated successfully!");
    res.redirect(`/blogs/${blog._id}`);
  } catch (err) {
    req.flash("error", err.message || "Failed to update blog");
    res.redirect(`/blogs/edit/${req.params.id}`);
  }
};

// DELETE /api/blogs/:id  (Protected - owner: soft delete, admin: hard delete)
const deleteBlog = async (req, res) => {
  try {
    const blog = req.blog; // attached by isOwnerOrAdmin middleware

    if (req.user.role === "admin") {
      // Hard delete
      unlinkImage(blog.image);
      await Blog.findByIdAndDelete(blog._id);
      req.flash("success", "Blog permanently deleted");
    } else {
      // Soft delete
      unlinkImage(blog.image);
      blog.image = null;
      blog.isDeleted = true;
      await blog.save();
      req.flash("success", "Blog deleted successfully");
    }

    res.redirect("/blogs");
  } catch (err) {
    req.flash("error", err.message || "Failed to delete blog");
    res.redirect("/blogs");
  }
};

module.exports = { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog };
