var express = require("express");
var router = express.Router();
require("dotenv").config();

var ErrMessage = {};
const userHelpers = require("../helpers/user-helpers");
var passport = require("passport");
const { ObjectId } = require("mongodb");
const { route } = require("./admin");
var paypal=require('paypal-rest-sdk')
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_SECRET
});
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

    console.log(screen,"scrreeen cchekibb");
    res.render("user/screen", {
      user: true,
      screen,
      Vip,
      Excecutive,
      Normal,
      Premium,
      data,
      user: req.user.Name,
    });
    
  });
});


router.post('/ticket-booking',(req,res)=>{
  console.log(req.body);

  // res.json({status:true})

if(req.body.paymentMethod==="Razorpay"){

  userHelpers.generateRazorpay(req.body,req.user._id).then((data)=>{

    res.json(data)
  })

}else if(req.body.paymentMethod==="Paypal"){
  



  console.log(req.body);
}else{
  res.json({status:false})
}

})
router.get('/pay',(req,res)=>{
  res.render('user/sample1')
})
router.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
  }
});

});

router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
});
router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then((response)=>{
    res.json({status:true})
  })
  console.log('hey')
})
/*
  userHelpers
    .getShowScreen(req.body.id)
    .then((screen, Vip, Excecutive, Normal, Premium) => {
      res.render("user/screen", { screen, Vip, Excecutive, Normal, Premium });
    });
*/
module.exports = router;
