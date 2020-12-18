var express = require("express");
var router = express.Router();
require("dotenv").config();
var ErrMessage = {};
const userHelpers = require("../helpers/user-helpers");
var passport = require("passport");
/* GET users listing. */
var client = require("twilio")(
  process.env.TWILIO_ACCOUNT_ID,
  process.env.TWILIO_AUTH_TOKEN
);
const verifyLogin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "user") {
    next();
  } else if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
router.get("/", verifyLogin,function (req, res, next) {
  res.render("user/sample");
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated() && req.user.role === "user") {
    console.log(req.user);
    res.redirect("/");
  } else if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login");
  }
});
router.post("/login", (req, res) => {
  var mobile =
    req.body.one +
    req.body.two +
    req.body.three +
    req.body.four +
    req.body.five +
    req.body.six +
    req.body.seven +
    req.body.eight +
    req.body.nine +
    req.body.ten;
  console.log(mobile);
  client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verifications.create({
      to: "+91" + mobile,
      channel: "sms",
    })
    .then((data) => {
      console.log(data);
      res.redirect("/verify-otp/" + mobile);
    })
    .catch((response) => {
      console.log(response);
    });
});
router.get("/verify-otp/:id", (req, res) => {
  res.render("user/otp", { mobile: req.params.id, ErrMessage });
});
router.post("/verify-otp", (req, res) => {
  var otp =
    req.body.one +
    req.body.two +
    req.body.three +
    req.body.four +
    req.body.five +
    req.body.six;

  console.log(otp);
  client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verificationChecks.create({
      to: "+91" + req.body.mobile,
      code: otp,
    })
    .then((data) => {
      console.log(data);
      if (data.status === "pending") {
        ErrMessage.otp = "Invalid Verification Code";
        res.redirect("/verify-otp/" + req.body.mobile);
      } else {
        userHelpers.checkLogin(req.body.mobile).then((response) => {
          console.log(response);
          if (response.userExist) {
            req.session.loggedIn = true;
            req.session.user = response.user;
            res.redirect("/");
          } else {
            res.render("user/signup", { mobile: req.body.mobile });
          }
        });
      }
    });
});

router.post("/signup/:id", (req, res) => {
  userHelpers.signup(req.params.id, req.body).then((response) => {
    req.session.loggedIn = true;
    req.session.user = response;

    res.redirect("/");
  });
});

router.get(
  "/google",
  passport.authenticate("user-google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("user-google", {
    failureRedirect: "/popup",
    successRedirect: "/popup",
    failureFlash: true,
  }),
  function (req, res) {
    res.send("hi");
    // Successful authentication, redirect home.
  }
);

router.get("/popup", (req, res, next) => {
  console.log("hey");
  res.render("user/auth-popup-callback", { layout: false });
});

router.get(
  "/facebook",
  passport.authenticate("user-facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("user-facebook", {
    failureRedirect: "/popup",
    successRedirect: "/popup",
  })
);

router.get("/logout", (req, res) => {
  req.session.destroy();
  req.logout();
  res.redirect("/login");
});

module.exports = router;
