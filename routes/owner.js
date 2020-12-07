var express = require("express");
var router = express.Router();
const ownerHelper = require("../helpers/owner-helper");
const adminHelper = require("../helpers/admin-helpers");



// ---verifyLogin----

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/owner/login");
  }
};
/* GET users listing. */
router.get("/", function (req, res, next) {
  adminHelper.getOwnerDetails().then((details) => {
    res.render("owner/home", { owner: true });
  });
});

router.get('/login',(req,res)=>{
  res.render('owner/login')
})

router.post('/login',(req,res)=>{
  ownerHelper.ownerLogin(req.body).then((response)=>{
    if (response.status) {
      req.session.ownerLoggedIn = true;
      req.session.owner = response.owner;
      res.redirect("/owner");
    } else {
      req.session.ownerLoggInErr = true;
      res.redirect("/owner/login");
    }
    // console.log(response);
  })
})


router.get('/user-details',(req,res)=>{
  res.render('owner/user',{owner:true})
})

router.get('/screen',(req,res)=>{
  res.render('owner/screen',{owner:true})
})

router.get('/bookings',(req,res)=>{
  res.render('owner/bookings',{owner:true})
})

router.get('/screen/schedule',(req,res)=>{
  res.render('owner/schedule',{owner:true})
})

router.get('/movies',(req,res)=>{
  res.render('owner/movie',{owner:true})
})

router.get('/upcoming-movies',(req,res)=>{
  res.render('owner/upcoming',{owner:true})
})

router.get('/add-movie',(req,res)=>{
  res.render('owner/add-movie',{owner:true})
})

router.get('/movie-image-upload',(req,res)=>{
  res.render('owner/movie-image-upload',{owner:true})
})


//get update password

router.get("/update-password", verifyLogin, (req, res) => {
  
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

module.exports = router;
