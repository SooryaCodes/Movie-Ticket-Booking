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
router.get("/", verifyLogin, function (req, res, next) {
  userHelpers.getMovies().then((Movie) => {
    // console.log(Horror,Action,Comedy,Drama,Romance);
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
    });
  });
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
            req.session.passport.user = response.user;
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
    req.session.passport.user = response;

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

router.get("/movie/:id", verifyLogin, (req, res) => {
  userHelpers.getMovieDetails(req.params.id).then((data) => {
    var Movie = data.Movie;
    var Owner = data.Owner;
    var Show = data.Show;
    console.log(Movie);
    for (var i = 0; i < Show.length; i++) {
      var date = new Date(Show[i].Date).toDateString();
      var showDate = date.split(" ");
      Show[i].Day = showDate[0];
      Show[i].DayDate = showDate[2];
      Show[i].Year = showDate[3];
      Show[i].Month = showDate[1];
    }

    console.log(Show);
    var showLength = Show.length;
    console.log(showLength);
    res.render("user/movie", { user: true, Movie, Owner, Show, showLength });
  });
});

router.post("/show-submit", (req, res) => {
  console.log(req.body);
  res.json({ status: true });
});

router.get("/seat-select/:id", verifyLogin, (req, res) => {
  userHelpers.getShowScreen(req.params.id).then((data) => {
    console.log(data, "data");
    var Vip = data.Vip;
    var Excecutive = data.Excecutive;
    var Normal = data.Normal;
    var Premium = data.Premium;
    var screen = data.screen;
var bookedSeats=data.show.Seats
console.log(bookedSeats);
    console.log(screen,"scrreeen cchekibb");
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
    });
    
  });
});


router.post('/ticket-booking',(req,res)=>{
  console.log(req.body);

  // res.json({status:true})

if(req.body.paymentMethod==="Razorpay"){

  userHelpers.generateRazorpay(req.body,req.user._id).then((data)=>{
data.Razorpay=true
    res.json(data)
  })
}else if(req.body.paymentMethod==="Paypal"){
  
  userHelpers.insertBooking(req.body,req.user._id).then((data)=>{
    userHelpers.generatePaypal(data).then((response)=>{
      console.log(response.transactions[0].amount,"response");
      // console.log(,"response");
      res.json(response.links[1].href);
    })
  })

}
else{
  res.json({status:false})
}

})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then((response)=>{
    res.json({status:true})
  })
  console.log('hey')
})
router.get('/success',(req,res)=>{
  res.send('Success')
})

router.get('/failure',(req,res)=>{
  res.send('failure')
})


const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const msg = {
  to: 'lakshmipr120@gmail.com', // Change to your recipient
  from: 'lakshmipr120@gmail.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}

router.get('/mail',(req,res)=>{
  res.send("mail sended Successfully")

sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error.response.body)
  })
})

module.exports = router;
