var express = require("express");
var router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");

var ErrMessage = {};
const userHelpers = require("../helpers/user-helpers");
var passport = require("passport");
const { response } = require("express");
const { cookie } = require("request");
const { Db } = require("mongodb");
const mailHelper = require("../helpers/mail-helper");

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
router.get("/", verifyLogin, function (req, res, next) {
  userHelpers.checkLocation(req.user).then((response) => {
    if (response.LocationExist) {
      console.log("hey");
      req.session.Location = true;
    } else {
      req.session.Location = false;
    }

    if (req.user.signup === true) {
      if (req.cookies.ref) {
        var token = req.cookies.ref;
        jwt.verify(token, process.env.USER_SECRET, async (err, decoded) => {
          if (err) {
            console.log("I don't know :)");
          } else {
            req.session.Reward = true
            //insert reward to this user
            var insert = await userHelpers.insertRewardThisUser(
              req.user._id,
              token
            );
          }
        });
      }
    }

    res.clearCookie("ref");
    userHelpers.getMovies().then((Movie) => {
      var Horror = Movie.filter((value) => value.Category === "Horror");
      var Action = Movie.filter((value) => value.Category === "Action");
      var Comedy = Movie.filter((value) => value.Category === "Comedy");
      var Drama = Movie.filter((value) => value.Category === "Drama");
      var Romance = Movie.filter((value) => value.Category === "Romance");
      res.render("user/home", {
        user: true,
        Horror,
        Action,
        Comedy,
        Drama,
        Romance,
        userDetails: req.user,
        Location: req.session.Location,
        Rewarded: req.session.Reward
      });
    });
  });
});

router.get("/login", (req, res) => {
  if (req.query.ref) {
    res.cookie("ref", req.query.ref, { path: "/" });
  }
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
            const passport = { user: response.user };

            req.session.passport = passport;
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
    response.signup = true;
    let token = jwt.sign(response, process.env.USER_SECRET);
    response.My_Referal = token;
    userHelpers.insertToken(response._id, token).then((anotherResponse) => {
      req.session.loggedIn = true;
      const passport = { user: response };
      req.session.passport = passport;
      res.redirect("/");
    });
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

router.get("/movie/:id", verifyLogin, (req, res) => {
  userHelpers.getMovieDetails(req.params.id).then((Movie) => {
    userHelpers.getAllMovies().then((TopMovies) => {
      userHelpers.getRatings(req.params.id).then((Ratings) => {
        console.log(Ratings);
        var RatingAverage = [];
        for (var i = 0; i < Ratings.length; i++) {
          RatingAverage[i] = Ratings[i].Rating;

          if (Ratings[i].Rating === 1) {
            Ratings[i].one = true;
          } else if (Ratings[i].Rating === 2) {
            Ratings[i].two = true;
          } else if (Ratings[i].Rating === 3) {
            Ratings[i].three = true;
          } else if (Ratings[i].Rating === 4) {
            Ratings[i].four = true;
          } else if (Ratings[i].Rating === 5) {
            Ratings[i].five = true;
          }
        }
        var AverageRatingCalculation =
          RatingAverage.reduce((a, b) => a + b, 0) / RatingAverage.length;
        console.log(AverageRatingCalculation);

        var RatingAverageOne = false;
        var RatingAverageTwo = false;
        var RatingAverageThree = false;
        var RatingAverageFour = false;
        var RatingAverageFive = false;
        if (AverageRatingCalculation >= 1 && AverageRatingCalculation < 2) {
          RatingAverageOne = true;
        } else if (
          AverageRatingCalculation >= 2 &&
          AverageRatingCalculation < 3
        ) {
          RatingAverageTwo = true;
        } else if (
          AverageRatingCalculation >= 3 &&
          AverageRatingCalculation < 4
        ) {
          RatingAverageThree = true;
        } else if (
          AverageRatingCalculation >= 4 &&
          AverageRatingCalculation < 5
        ) {
          RatingAverageFour = true;
        } else if (
          AverageRatingCalculation >= 5 &&
          AverageRatingCalculation < 6
        ) {
          RatingAverageFive = true;
        }

        res.render("user/movie", {
          user: true,
          Movie,
          TopMovies,
          Ratings,
          userDetails: req.user,
          RatingAverageOne,
          RatingAverageTwo,
          RatingAverageThree,
          RatingAverageFour,
          RatingAverageFive,
        });
      });
    });
  });
});

router.post("/getTheater/:id", (req, res) => {
  console.log(req.params.id);
  userHelpers.getTheaterDetails(req.params.id).then((response) => {
    console.log(response);
    res.json(response);
  });
});

router.post("/getScreenDetails/:movieId/:ownerId", (req, res) => {
  console.log(req.params.movieId, req.params.ownerId, "ownerID");
  userHelpers
    .getScreenDetails(req.params.movieId, req.params.ownerId)
    .then((response) => {
      res.json(response);
    });
});
router.post("/getShowDetails/:movieId/:screenId", (req, res) => {
  console.log(req.params.movieId, req.params.ownerId);
  userHelpers
    .getShowDetails(req.params.movieId, req.params.screenId)
    .then((response) => {
      for (var i = 0; i < response.length; i++) {
        var date = new Date(response[i].Date).toDateString();
        var showDate = date.split(" ");
        response[i].Day = showDate[0];
        response[i].DayDate = showDate[2];
        response[i].Year = showDate[3];
        response[i].Month = showDate[1];
        var time = response[i].Time.split(":");
        response[i].Time = time[0] + "-" + time[1];
      }
      console.log(response, "respo");
      res.json(response);
    });
});
router.post("/show-submit", (req, res) => {
  console.log(req.body);
  res.json({ status: true });
});

router.get("/seat-select/:id/:ownerId", verifyLogin, (req, res) => {
  userHelpers.getShowScreen(req.params.id).then(async (data) => {
    console.log(data, "data");
    var Vip = data.Vip;
    var Excecutive = data.Excecutive;
    var Normal = data.Normal;
    var Premium = data.Premium;
    var screen = data.screen;
    var bookedSeats = data.show.Seats;
    console.log(bookedSeats);

    var DetailsUser = await userHelpers.getWallet(req.user._id)
    console.log(DetailsUser.Wallet);
    console.log(DetailsUser.Rewards);
    console.log(screen, "scrreeen cchekibb");
    res.render("user/screen", {
      user: true,
      screen,
      Vip,
      Excecutive,
      Normal,
      Premium,
      data,
      bookedSeats,
      user: req.user.Name,
      ownerId: req.params.ownerId,
      // TotalWallet,
      Wallet: DetailsUser.Wallet,
      Rewards: DetailsUser.Rewards,
      DetailsUser
    });
  });
});

router.post("/ticket-booking", (req, res) => {
  console.log(req.body);

  // res.json({status:true})

  if (req.body.paymentMethod === "Razorpay") {
    userHelpers.generateRazorpay(req.body, req.user._id).then((data) => {
      data.Razorpay = true;
      res.json(data);
    });
  } else if (req.body.paymentMethod === "Paypal") {
    userHelpers.insertBooking(req.body, req.user._id).then((data) => {
      userHelpers.generatePaypal(data.details, data.bookingId).then((response) => {

        res.json(response.links[1].href);
      });
    });
  } else {
    res.json({ status: false });
  }
});

router.post("/verify-payment", (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then((response) => {
    if (response.status === true) {
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  });
});

router.post('/another-payment/:method/:id', (req, res) => {
  if (req.params.method === 'Razorpay') {

    userHelpers.generateRazorpayAnother(req.params.id).then((response) => {
      res.json(response)
    })
  } else if (req.params.method === 'Paypal') {
    userHelpers.generatePaypalAnother(req.params.id).then((response) => {

      res.json(response)
    })

  }
})



router.get('/booking-success', (req, res) => {
  userHelpers.changeStatus(req.query.id, req.user._id).then((Response) => {
    var dynamic_template_data={
      Link:'http://localhost:3000'
    }
    mailHelper.sendPayment(req.user.Email,process.env.MY_EMAIL,'d-e697e803620148f2bdf3529366c5eb22',dynamic_template_data)
    res.render('user/success', { userDetails: req.user, user: true })
  })
})
router.get('/booking-failure', (req, res) => {
  userHelpers.changeStatusToPending(req.query.id).then((Response) => {
    var dynamic_template_data={
      Link:'http://localhost:3000'
    }
    mailHelper.sendPayment(req.user.Email,process.env.MY_EMAIL,'d-1e27f2359bf7426489777d0b4f3f67fe',dynamic_template_data)
    res.render('user/failure', { userDetails: req.user, user: true })
  })
})

router.post("/rating/:movieId", (req, res) => {
  userHelpers
    .rateMovie(req.params.movieId, req.user, req.body)
    .then((response) => {
      res.json({ status: true });
    });
});

router.post("/getLocation", (req, res) => {
  userHelpers.addLocation(req.user._id, req.body).then((response) => {
    res.json({ status: true });
    console.log(response);
  });
});

//search

router.get("/search", (req, res) => {
  res.render("user/search", { user: true, userDetails: req.user });
});

router.get("/account", verifyLogin, (req, res) => {
  res.render("user/account", { userDetails: req.user, user: true });
});

router.post("/getUserDetails", (req, res) => {
  userHelpers.getUserData(req.user._id).then((response) => {
    console.log(response);
    res.json(response);
  });
});

router.post("/update-name", (req, res) => {
  console.log(req.body);
  userHelpers.updateName(req.body.Name, req.user._id).then((response) => {
    res.json({ status: true });
  });
});
router.post("/update-mobile", (req, res) => {
  console.log(req.body);
  userHelpers.updateMobile(req.body.Mobile, req.user._id).then((response) => {
    res.json({ status: true });
  });
});
router.post("/update-email", (req, res) => {
  console.log(req.body, "hey");
  if (req.body.Email === req.user.Email) {
    userHelpers.updateEmail(req.body.Email, req.user._id).then((response) => {
      res.json({ status: true });
    });
  } else {
    userHelpers
      .updateEmail(req.body.Email, req.user._id)
      .then((anotherResponse) => {
        res.json({ Logout: true });
      });
  }
});

router.post('/getBookings', (req, res) => {
  userHelpers.getBookings(req.user._id).then((Response) => {
    res.json(Response)
  })
})

module.exports = router;
