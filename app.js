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
var passport=require('passport')
var session = require("express-session");
var fileUpload = require("express-fileupload");
var app = express();
var MongoDBStore = require("connect-mongodb-session")(session);
var flash=require('express-flash')
var helmet=require('helmet')
// view engine setup
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
app.use(helmet({
  contentSecurityPolicy:false
}));

app.use(
  session({
    secret: "Key",
    cookie: { maxAge: 6000000 },
    store: new MongoDBStore({
      mongoConnection: db.connection,
      databaseName:"Movie"
    }),
  })
);
var initializePassport=require('./passport/passport-setup').initializePassport
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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
