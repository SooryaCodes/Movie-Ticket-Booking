var express = require("express");
var router = express.Router();
const ownerHelper = require("../helpers/owner-helper");
const adminHelper = require("../helpers/admin-helpers");
const bcrypt = require("bcrypt");

const passport = require("passport");
const LocalStrategy = require("passport-local");

var db = require("../config/connection");
var collection = require("../config/collection");


require('../passport/passport-setup-google-owner')
require('../passport/owner-local')
// // ------
const verifyLoginHome = (req, res, next) => {
  if (req.isAuthenticated() && req.session.passport.user.role==="owner") {
    // res.redirect('/owner')
    return next();
  } else {
    res.redirect("/owner/login");
  }
};
const verifyLogin=(req,res,next)=>{
if(req.isAuthenticated() && req.session.passport.user.role==="owner"){

  next()
}
}

/* GET users listing. */
router.get("/",verifyLoginHome, function (req, res, next) {
  adminHelper.getOwnerDetails().then((details) => {
    res.render("owner/home", { owner: true });
  });
});

router.get("/login",verifyLogin, (req, res) => {
    res.render("owner/login");
});

router.get('/google',verifyLogin, passport.authenticate('owner-google', { scope: ['profile', 'email'] }));

router.get('/google/callback', verifyLogin,passport.authenticate('owner-google', { failureRedirect: '/owner/login',successRedirect:'/owner' ,failureFlash:true}),
function(req, res) {
  // Successful authentication, redirect home.
  if(req.isAuthenticated()){

    res.redirect('/owner');
  }else{
    res.redirect('/owner/login')
  }
}
);
router.post(
  "/login",
  verifyLogin,
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

router.get("/logout", (req, res) => {
  req.session.destroy();
  req.logout()
  res.redirect("/owner/login");
});

router.get("/user-details", verifyLogin, (req, res) => {
  res.render("owner/user", { owner: true });
});

router.get("/screen", verifyLogin, (req, res) => {
ownerHelper.getScreen(req.session.passport.user._id).then((data)=>{
  console.log(data.Screen.length);
  if(data.Screen.length<1){
    res.render('owner/screen-dummy',{owner:true})
  }else{
    res.render("owner/screen", { owner: true ,Screen:data.Screen});
  }
})
});

router.get('/add-screen',verifyLogin, (req,res)=>{
  res.render('owner/add-screen',{owner:true})

})

router.post('/add-screen',(req,res)=>{
  ownerHelper.addScreen(req.body,req.session.passport.user._id).then((data)=>{

  })
  res.redirect('/owner/screen')

})


router.get('/edit-screen/:id',verifyLogin,(req,res)=>{
  console.log(req.params.id);
 var id=req.params.id
  res.render("owner/edit-screen",{owner:true,id})
})

router.post('/edit-screen/:id',(req,res)=>{
  ownerHelper.editScreen(req.params.id,req.body).then((response)=>{
    res.redirect('/owner/screen')
  })
})
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
