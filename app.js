var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("express-handlebars");
var db = require("./config/connection");
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
var ownerRouter = require("./routes/owner");
var passport = require('passport')
var session = require("express-session");
var fileUpload = require("express-fileupload");
var app = express();
var MongoDBStore = require("connect-mongodb-session")(session);
var flash = require('express-flash')
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
// app.use(helmet({
//   contentSecurityPolicy:false
// }));

app.use(
  session({
    secret: "Key",
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    store: new MongoDBStore({
      mongoConnection: db.connection,
      databaseName: "Movie"
    }),
  })
);
var initializePassport = require('./passport/passport-setup').initializePassport;
const router = require("./routes/admin");
initializePassport(passport)
app.use(passport.initialize())
app.use(passport.session())


app.use(flash())
db.connect((err) => {
  if (err) console.log("Connection Invalid" + err);
  else console.log("Database connected");
});
app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/owner", ownerRouter);


// 404 route

app.get("/404", (req, res) => {
  res.status(404).render("404", {
    title: "Page Not Found"
  });
});

// 500 route

app.get("/500", (req, res) => {
  res.status(500).render("500", {
    title: "Internal Server Error"
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).render("404", {
    title: "Page Not Found"
  })
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("500", {
    title: "Internal Server Error"
  });
});


module.exports = app;
