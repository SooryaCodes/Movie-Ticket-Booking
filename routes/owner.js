var express = require("express");
var router = express.Router();
const ownerHelper = require("../helpers/owner-helper");
const adminHelper = require("../helpers/admin-helpers");
const bcrypt = require("bcrypt");

const passport = require("passport");
const LocalStrategy = require("passport-local");

var db = require("../config/connection");
var collection = require("../config/collection");


// // ------
const verifyLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.set(
      "Cache-Control",
      "no-cache , private,no-store,must-revalidate,post-check=0,pre-check=0"
    );
    return next();
  } else {
    res.redirect("/owner/login");
  }
};

/* GET users listing. */
router.get("/",verifyLogin, function (req, res, next) {
  adminHelper.getOwnerDetails().then((details) => {
    res.render("owner/home", { owner: true });
  });
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    res.set(
      "Cache-Control",
      "no-cache , private,no-store,must-revalidate,post-check=0,pre-check=0"
    );
    res.redirect("/owner");
  } else {
    res.render("owner/login");
  }
});

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  db.get()
    .collection(collection.OWNER_COLLECTION)
    .findOne(
      {
        _id: user._id,
      },
      function (err, user) {
        done(err, user);
      }
    );
});
passport.use(
  "owner-local",
  new LocalStrategy(
   
    function (username, password, done) {
      console.log(password);
      db.get()
        .collection(collection.OWNER_COLLECTION)
        .findOne({ Name: username }, function (err, user) {
          if (err) {
            return done(err, { message: "Invalid Username Or Password" });
          }

          if (!user) {
            console.log("username not ");
            return done(null, false, { message: "Incorrect username" });
          }

          bcrypt.compare(password, user.Password, (matchErr, match) => {
            console.log(match);
            if (matchErr) {
              console.log("password inccorredt");
              return done(null, false, { message: "Incorrect Password" });
            }
            if (!match) {
              console.log("password inccorredt");
              return done(null, false, { message: "Incorrect Password" });
            }
            if (match) {
              return done(null, user);
            }
          });
        });
    }
  )
);

router.post(
  "/login",
  passport.authenticate("owner-local", {
    failureRedirect: "/owner/login",
    successRedirect: "/owner",
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect("/owner");
    // console.log(response);
  }
);

router.get("/logout", verifyLogin, (req, res) => {
  req.session.destroy();
  res.redirect("/owner/login");
});

router.get("/user-details", verifyLogin, (req, res) => {
  res.render("owner/user", { owner: true });
});

router.get("/screen", verifyLogin, (req, res) => {
  res.render("owner/screen", { owner: true });
});

router.get("/bookings", verifyLogin, (req, res) => {
  res.render("owner/bookings", { owner: true });
});

router.get("/screen/schedule", verifyLogin, (req, res) => {
  res.render("owner/schedule", { owner: true });
});

router.get("/movies", verifyLogin, (req, res) => {
  res.render("owner/movie", { owner: true });
});

router.get("/upcoming-movies", verifyLogin, (req, res) => {
  res.render("owner/upcoming", { owner: true });
});

router.get("/add-movie", verifyLogin, (req, res) => {
  res.render("owner/add-movie", { owner: true });
});

router.get("/movie-image-upload", verifyLogin, (req, res) => {
  res.render("owner/movie-image-upload", { owner: true });
});

//get update password

router.get("/update-password", verifyLogin, (req, res) => {
  res.render("owner/update-password", {
    owner: true,
  });
});

// //post update password

// router.post("/update-password",verifyLogin, (req, res) => {
//   ownerHelper.updatePassword(req.body).then((response) => {
//     if (response.status) {
//       adminHelper.getOwnerDetails().then((data) => {
//         req.session.owner.adminPassword = data.adminPassword;
//         res.redirect("/admin");
//       });
//     } else {
//       req.session.passErr = true;
//       res.redirect("/admin/update-password");
//     }
//   });
// });

router.get("/edit-profile", verifyLogin, (req, res) => {
  res.render("owner/edit-profile", { owner: true });
});

module.exports = router;
