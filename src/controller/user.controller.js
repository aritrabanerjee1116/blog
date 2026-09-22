const fs = require("fs");
const path = require("path");
const User = require("../model/user.model");
const Blog = require("../model/blog.model");

// GET /api/users  (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/users/:id  (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/users");
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      req.flash("error", "You cannot delete your own account");
      return res.redirect("/users");
    }

    // Delete profile image if exists
    if (user.profileImage) {
      const imgPath = path.join(__dirname, "../../public/uploads", user.profileImage);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    // Hard delete user's blogs and their images
    const userBlogs = await Blog.find({ author: user._id });
    for (const blog of userBlogs) {
      if (blog.image) {
        const imgPath = path.join(__dirname, "../../public/uploads", blog.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }
    }
    await Blog.deleteMany({ author: user._id });

    await User.findByIdAndDelete(req.params.id);

    req.flash("success", `User "${user.name}" deleted successfully`);
    res.redirect("/users");
  } catch (err) {
    req.flash("error", err.message || "Failed to delete user");
    res.redirect("/users");
  }
};

module.exports = { getAllUsers, deleteUser };
