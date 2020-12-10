var express = require("express");
var router = express.Router();
const ownerHelper = require("../helpers/owner-helper");
const adminHelper = require("../helpers/admin-helpers");
const bcrypt = require("bcrypt");

const passport = require("passport");
const LocalStrategy = require("passport-local");

var db = require("../config/connection");
var collection = require("../config/collection");
const { response } = require("../app");


// require('../passport/passport-setup-google-owner')
// require('../passport/owner-local')
// // // ------
// const ome = (req, res, next) => {
//   if (req.isAuthenticated() && req.session.passport.user.role==="owner") {
//     // res.redirect('/owner')
//     return next();
//   } else {
//     res.redirect("/owner/login");
//   }
// };
// const verifyLogin=(req,res,next)=>{
// if(req.isAuthenticated() ){

//   next()
// }
// }

/* GET users listing. */
router.get("/", function (req, res, next) {
  adminHelper.getOwnerDetails().then((details) => {
    console.log("hikjbcs");
    // console.log(req.session.passport.user);
    res.render("owner/home", { owner: true });
  });
});

router.get("/login", (req, res) => {
    res.render("owner/login");
});

router.get('/google', passport.authenticate('owner-google', { scope: ['profile', 'email'] }));

router.get('/google/callback',passport.authenticate('owner-google', { failureRedirect: '/owner/login',successRedirect:'/owner' ,failureFlash:true}),
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

router.get("/user-details", (req, res) => {
  res.render("owner/user", { owner: true });
});

router.get("/screen",  (req, res) => {
ownerHelper.getScreen().then((data)=>{
  console.log(data.length);
  if(data.length<1){
    res.render('owner/screen-dummy',{owner:true})
  }else{
    console.log(data.length);
    res.render("owner/screen", { owner: true ,Screen:data});
  }
})
});

router.get('/add-screen', (req,res)=>{
  res.render('owner/add-screen',{owner:true})

})

router.post('/add-screen',(req,res)=>{
  ownerHelper.addScreen(req.body,req.session.passport.user._id).then((data)=>{

  })
  res.redirect('/owner/screen')

})


router.get('/edit-screen/:id',(req,res)=>{
  console.log(req.params.id);
 var id=req.params.id
  res.render("owner/edit-screen",{owner:true,id})
})

router.post('/edit-screen/:id',(req,res)=>{
  ownerHelper.editScreen(req.params.id,req.body).then((response)=>{
    console.log(response);
    res.redirect('/owner/screen')
  })
})

router.post('/delete-screen/:id',(req,res)=>{
  ownerHelper.deleteScreen(req.params.id).then((response)=>{
    console.log(response,"delete");
    res.json({status:true})
  })
})
router.get("/bookings",  (req, res) => {
  res.render("owner/bookings", { owner: true });
});

router.get("/screen/schedule",  (req, res) => {
  res.render("owner/schedule", { owner: true });
});

router.get("/movies",  (req, res) => {
  res.render("owner/movie", { owner: true });
});

router.get("/upcoming-movies",  (req, res) => {
  res.render("owner/upcoming", { owner: true });
});

router.get("/add-movie",  (req, res) => {
  res.render("owner/add-movie", { owner: true });
});

router.get("/movie-image-upload",  (req, res) => {
  res.render("owner/movie-image-upload", { owner: true });
});

//get update password

router.get("/update-password",  (req, res) => {
  res.render("owner/update-password", {
    owner: true,
  });
});

// //post update password

// router.post("/update-password", (req, res) => {
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

router.get("/edit-profile",  (req, res) => {
  res.render("owner/edit-profile", { owner: true });
});

module.exports = router;
