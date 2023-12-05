"use strict";

var express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  ejs = require("ejs"),
  session = require("express-session"),
  passport = require("passport"),
  multer = require("multer"),
  uid = require("uid"),
  path = require("path"),
  sanitizer = require("express-sanitizer"),
  methodOverride = require("method-override"),
  localStrategy = require("passport-local"),
  MongoStore = require("connect-mongodb-session")(session),
  flash = require("connect-flash"),
  crypto = require("crypto"),
  User = require("./models/user"),
  userRoutes = require("./routes/users"),
  adminRoutes = require("./routes/admin"),
  bookRoutes = require("./routes/books"),
  authRoutes = require("./routes/auth");

// const Seed = require('./seed');

// uncomment below line for first time to seed database;
// Seed(1000);

if (process.env.NODE_ENV !== "production") require("dotenv").config();

// app config
app.engine(".html", ejs.renderFile);
app.set("view engine", "html");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.use(express["static"](__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(sanitizer());

// db config
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(function () {
  return console.log("MongoDB is connected");
})["catch"](function (error) {
  return console.log(error);
});

//PASSPORT CONFIGURATION

var store = new MongoStore({
  uri: process.env.DB_URL,
  collection: "sessions"
});
app.use(session({
  //must be declared before passport session and initialize method
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  store: store
}));
app.use(flash());
app.use(passport.initialize()); //must declared before passport.session()
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// configure image file storage
var fileStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, "images");
  },
  filename: function filename(req, file, cb) {
    cb(null, "".concat(crypto.randomBytes(12).toString("hex"), "-").concat(file.originalname));
  }
});
var filefilter = function filefilter(req, file, cb) {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(multer({
  storage: fileStorage,
  fileFilter: filefilter
}).single("image"));
app.use("/images", express["static"](path.join(__dirname, "images")));
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.warning = req.flash("warning");
  next();
});

//Routes
app.use(userRoutes);
app.use(adminRoutes);
app.use(bookRoutes);
app.use(authRoutes);
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("server is running at http://localhost:".concat(PORT));
});
//# sourceMappingURL=app.js.map