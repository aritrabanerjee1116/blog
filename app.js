require("dotenv").config();

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");          
dns.setServers(["1.1.1.1", "8.8.8.8", "9.9.9.9", "8.8.4.4"]);


const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");

const connectDB = require("./src/config/db");
const { verifyToken } = require("./src/middleware/auth.middleware");

const authRoute = require("./src/route/auth.route");
const userRoute = require("./src/route/user.route");
const blogRoute = require("./src/route/blog.route");
const pageRoute = require("./src/route/page.route");

const app = express();

// Connect to MongoDB
connectDB();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Method override (for PUT/DELETE from HTML forms via ?_method=)
app.use(methodOverride("_method"));

// Session (required for flash)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

// Flash
app.use(flash());

// Attach JWT user to req & res.locals
app.use(verifyToken);

// Make user and flash messages available in all EJS views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/blogs", blogRoute);

// EJS Page Routes
app.use("/", pageRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  req.flash("error", err.message || "Something went wrong");
  const target = req.get("Referrer") || "/";
  res.redirect(target);
});

const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
