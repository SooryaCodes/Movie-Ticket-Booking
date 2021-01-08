var express = require("express");
var router = express.Router();
const ownerHelper = require("../helpers/owner-helper");
const adminHelper = require("../helpers/admin-helpers");
const bcrypt = require("bcrypt");
const hbs = require("nodemailer-express-handlebars");
var mailHelper = require('../helpers/mail-helper')
const passport = require("passport");
const LocalStrategy = require("passport-local");
const nodemailer = require("nodemailer");
var db = require("../config/connection");
var collection = require("../config/collection");
const { getMovies } = require("../helpers/owner-helper");
const { response } = require("express");
const { route } = require("./admin");
const jwt = require("jsonwebtoken");
const JSONTransport = require("nodemailer/lib/json-transport");
const userHelpers = require("../helpers/user-helpers");
//nodemailer

let mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL, // generated ethereal user
    pass: process.env.MY_PASSWORD, // generated ethereal password
  },
});

var options = {
  viewEngine: {
    extname: ".hbs",
    layoutsDir: "views/email/",
    defaultLayout: "layout",
  },
  viewPath: "views/email/",
};

mailer.use("compile", hbs(options));

const verifyLogin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "owner") {
    next();
  } else {
    res.redirect("/owner/login");
  }
};
const verifyLoginGoogle = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/owner/login");
  }
};

/* GET users listing. */
router.get("/", verifyLogin, function (req, res, next) {
  ownerHelper.getTodayShows().then((response) => {
    ownerHelper.checkLocation(req.user).then((LocationResponse) => {
      if (LocationResponse.LocationExist) {
        console.log("hey");
        req.session.Location = true;
      } else {
        req.session.Location = false;
      }
      var ZeroShows
      if (response.length === 0) {
        ZeroShows = true
      } else {
        ZeroShows = false
      }
      res.render("owner/home", { owner: true, ownerDetails: req.user, ownerId: req.user._id, Shows: response, ZeroShows, Location: req.session.Location, });
    })
  })
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated() && req.user.role === "owner") {
    res.redirect("/owner");
  } else {
    res.render("owner/login", { noOwner: req.session.ownerNoAccount });
  }
});

router.get(
  "/google",
  passport.authenticate("owner-google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("owner-google", {
    failureRedirect: "/owner/popup",
    successRedirect: "/owner/popup",
    failureFlash: true,
  }),
  function (req, res) {
    // Successful authentication, redirect home.
  }
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
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy();
  req.logout();
  res.redirect("/owner/login");
});

router.get("/user-details", verifyLogin, (req, res) => {
  res.render("owner/user", { owner: true, ownerDetails: req.user });
});

router.get("/screen", verifyLogin, (req, res) => {
  ownerHelper.getScreens(req.user._id).then((data) => {
    if (data.length < 1) {
      res.render("owner/screen-dummy", { owner: true, ownerDetails: req.user });
    } else {
      res.render("owner/screen", {
        owner: true,
        Screen: data,
        ownerDetails: req.user,
      });
    }
  });
});

router.get("/add-screen", verifyLogin, (req, res) => {
  res.render("owner/add-screen", { owner: true, ownerDetails: req.user });
});

router.post("/add-screen", (req, res) => {

  ownerHelper
    .addScreen(req.body, req.session.passport.user._id)
    .then((data) => { });
  res.redirect("/owner/screen");
});

router.get("/edit-screen/:id", verifyLogin, (req, res) => {
  var id = req.params.id;
  ownerHelper.getScreen(id).then((response) => {
    res.render("owner/edit-screen", {
      owner: true,
      id,
      screen: response,
      ownerDetails: req.user,
    });
  });
});

router.post("/edit-screen/:id", (req, res) => {
  ownerHelper.editScreen(req.params.id, req.body).then((response) => {
    res.redirect("/owner/screen");
  });
});

router.post("/delete-screen/:id", (req, res) => {
  ownerHelper.deleteScreen(req.params.id).then((response) => {
    res.json({ status: true });
  });
});
router.get("/bookings", verifyLogin, (req, res) => {
  res.render("owner/bookings", { owner: true, ownerDetails: req.user });
});

router.get("/movies", verifyLogin, (req, res) => {
  ownerHelper.getMovies().then((details) => {
    if (details.length < 1) {
      res.render("owner/movie-dummy", { owner: true, ownerDetails: req.user });
    } else {
      res.render("owner/movie", {
        owner: true,
        movie: details,
        ownerDetails: req.user,
      });
    }
  });
});

router.get("/add-movie", (req, res) => {
  res.render("owner/add-movie", { owner: true, ownerDetails: req.user });
});
router.post("/add-movie", (req, res) => {
  ownerHelper.addMovie(req.body, req.user._id).then((response) => {
    res.render("owner/movie-image-upload", { id: req.body._id, owner: true, ownerDetails: req.user, });
  });
});

router.post("/movie-image-upload/:id", (req, res) => {
  var id = req.params.id;
  var image = req.files.croppedImage;
  image.mv("./public/images/owner/movie/" + id + ".jpg");
  res.json({ status: true });
});

router.get("/edit-movie/:id", verifyLogin, (req, res) => {
  ownerHelper.getMovie(req.params.id).then((response) => {
    res.render("owner/edit-movie", {
      id: req.params.id,
      owner: true,
      movie: response,
      ownerDetails: req.user,
    });
  });
});

router.post("/edit-movie/:id", (req, res) => {
  var id = req.params.id;
  ownerHelper.editMovie(req.body, id).then((response) => { });
  res.render("owner/edit-movie-image-upload", {
    id,
    owner: true,
    ownerDetails: req.user,
  });
});

router.post("/edit-movie-image-upload/:id", (req, res) => {
  if (req.files.croppedImage) {
    var id = req.params.id;
    var image = req.files.croppedImage;
    image.mv("./public/images/owner/movie/" + id + ".jpg");
    res.json({ status: true });
  }
});

router.post("/delete-movie/:id", (req, res) => {
  ownerHelper.deleteMovie(req.params.id).then((response) => {
    res.json({ status: true });
  });
});

//upcoming movie
router.get("/upcoming-movies", verifyLogin, (req, res) => {
  ownerHelper.getUpcomingMovies(req.user._id).then((details) => {
    if (details.length < 1) {
      res.render("owner/upcoming-movie-dummy", {
        owner: true,
        ownerDetails: req.user,
      });
    } else {
      res.render("owner/upcoming-movie", {
        owner: true,
        movie: details,
        ownerDetails: req.user,
      });
    }
  });
});
router.get("/add-upcoming-movie", (req, res) => {
  res.render("owner/upcoming-add-movie", {
    owner: true,
    ownerDetails: req.user,
  });
});

router.post("/add-upcoming-movie", (req, res) => {
  ownerHelper.addUpcomingMovie(req.body, req.user._id).then((response) => {
    res.render("owner/upcoming-movie-image-upload", {
      id: req.body._id,
      owner: true,
      ownerDetails: req.user,
    });
  });
});

router.post("/upcoming-movie-image-upload/:id", (req, res) => {
  var id = req.params.id;
  var image = req.files.croppedImage;

  image.mv("./public/images/owner/movie/" + id + ".jpg");
  res.json({ status: true });
});

router.get("/edit-upcoming-movie/:id", verifyLogin, (req, res) => {
  ownerHelper.getUpcomingMovie(req.params.id).then((response) => {
    res.render("owner/upcoming-edit-movie", {
      id: req.params.id,
      owner: true,
      movie: response,
      ownerDetails: req.user,
    });
  });
});

router.post("/edit-upcoming-movie/:id", (req, res) => {
  var id = req.params.id;
  ownerHelper.editUpcomingMovie(req.body, id).then((response) => { });
  res.render("owner/upcoming-edit-movie-image-upload", { id, owner: true, ownerDetails: req.user, });
});

router.post("/edit-upcoming-movie-image-upload/:id", (req, res) => {
  if (req.files.croppedImage) {
    var id = req.params.id;
    var image = req.files.croppedImage;
    image.mv("./public/images/owner/movie/" + id + ".jpg");
    res.json({ status: true });
  }
});

router.post("/delete-upcoming-movie/:id", (req, res) => {
  ownerHelper.deleteUpcomingMovie(req.params.id).then((response) => {
    res.json({ status: true });
  });
});

router.get("/popup", (req, res, next) => {
  res.render("owner/auth-popup-callback", { layout: false });
});

//get update password

router.get("/update-password", verifyLogin, (req, res) => {
  res.render("owner/update-password", {
    passErr: req.session.passErr,
    owner: true,
    ownerDetails: req.user,
  });
});

// //get edit profile

router.get("/edit-profile", verifyLogin, (req, res) => {
  res.render("owner/edit-profile", { owner: true, ownerDetails: req.user });
});

//show schedule

router.get("/screen/show/:id", (req, res) => {
  ownerHelper.getScreen(req.params.id).then((screen) => {
    ownerHelper.getShowSchedule(req.params.id).then((show) => {
      if (show.length < 1) {
        res.render("owner/show-dummy", {
          owner: true,
          id: req.params.id,
          screen,
          ownerDetails: req.user,
        });
      } else {
        res.render("owner/show", {
          owner: true,
          id: req.params.id,
          screen,
          show,
          ownerDetails: req.user,
        });
      }
    });
  });
});

router.get("/add-show/:id", (req, res) => {
  ownerHelper.getMovies().then((movies) => {
    var id = req.params.id;
    res.render("owner/add-show", {
      owner: true,
      movies,
      id,
      ownerDetails: req.user,
    });
  });
});

router.post("/add-show/:id", (req, res) => {
  ownerHelper
    .addShow(req.body, req.params.id, req.user._id)
    .then((response) => {
      res.redirect("/owner/screen");
    });
});

router.get("/edit-show/:id", (req, res) => {
  var id = req.params.id;

  ownerHelper.getMovies().then((movies) => {
    ownerHelper.getShow(id).then((show) => {
      res.render("owner/edit-show", {
        owner: true,
        id,
        show,
        movies,
        ownerDetails: req.user,
      });
    });
  });
});

router.post("/edit-show/:id", (req, res) => {
  ownerHelper.editShow(req.body, req.params.id).then((response) => {
  });
  res.redirect("/owner/screen");
});

router.post("/delete-show/:id", (req, res) => {
  ownerHelper.deleteShow(req.params.id).then((response) => {
    res.json({ status: true });
  });
});

router.post("/date-time/:id", (req, res) => {
  ownerHelper.getDateTime(req.body, req.params.id).then((response) => {
    res.json(response);
  });
});
router.post("/forgot-password", (req, res) => {
  ownerHelper.checkOwner(req.body.email).then((response) => {
    if (response.status === true) {
      var profile = {
        email: req.body.email,
      };
      let token = jwt.sign(profile, process.env.OWNER_SECRET, {
        expiresIn: 600,
      });

      var template_data = {
        Link: `http://localhost:3000/owner/forgot-password/verify-mail/${token}`
      }
      mailHelper.sendForgotPassword(req.body.email, process.env.OFFICIAL_EMAIL_ID, 'd-be0314b8f200467788d3dc4fd0ab4f7d', template_data)
      req.session.ownerNoAccount = false;
      res.redirect("/owner/forgot-password/" + req.body.email);
    } else {
      req.session.ownerNoAccount = true;
      res.redirect("/owner/login");
    }
  });
});

router.get("/forgot-password/:email", (req, res) => {
  var email = req.params.email.slice(0, 6)
  res.render("owner/show-page", { email: email });
});
router.get("/forgot-password/verify-mail/:token", (req, res) => {
  let token = req.params.token;

  jwt.verify(token, process.env.OWNER_SECRET, (err, decoded) => {
    if (err) {
      res.send("authentication failed");
    } else {
      res.render('owner/forgot-password-reset', { email: decoded.email })
    }
  });
});



router.post('/forgot-password-update-password/:email', (req, res) => {
  ownerHelper.forgotPasswordUpdateNewPassword(req.params.email, req.body.Password).then((response) => {
    res.redirect('/owner')
  })
})
//post update password

router.post("/update-password", (req, res) => {
  ownerHelper.updatePassword(req.body).then((response) => {
    if (response.status) {
      res.redirect("/owner");
    } else {
      req.session.passErr = true;
      res.redirect("/owner/update-password");
    }
  });
});

//post edit profile

router.post("/edit-profile/:id", verifyLogin, (req, res) => {
  let id = req.params.id;
  ownerHelper.editProfile(id, req.body).then((data) => {
    res.redirect("/owner");
    if (req.files.image) {
      let Image = req.files.image;
      Image.mv("./public/images/owner/profile/owner" + id + ".jpg");
    }
  });
});






router.get('/get-bar-chart-data', (req, res) => {
  ownerHelper.getBarChartData(req.user._id).then((response) => {
    // console.log(response);
    res.json(response)
  })
})



router.post("/change-to-now-showing/:id", (req, res) => {
  ownerHelper.changeToNowShowing(req.params.id).then((response) => {
    res.json({ status: true })
  })
})




router.post('/getAnalytics', (req, res) => {
  ownerHelper.getAnalytics(req.user._id).then((response) => {
    res.json(response)
  })
})


router.post('/getLineChartData', (req, res) => {
  ownerHelper.getLineChartData(req.user._id).then((response) => {
    var January = response.January
    var February = response.February
    var March = response.March
    var April = response.April
    var May = response.May
    var June = response.June
    var July = response.July
    var August = response.August
    var September = response.September
    var October = response.October
    var November = response.November
    var December = response.December
    res.json({ January, February, March, April, May, June, July, August, September, October, November, December })
  })
})



router.post("/getLocation", (req, res) => {
  ownerHelper.addLocation(req.user._id, req.body).then((response) => {
    res.json({ status: true });
    console.log(response);
  });
});
module.exports = router;
