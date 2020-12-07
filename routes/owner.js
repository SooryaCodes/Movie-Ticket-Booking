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
  res.render('owner/user')
})

router.get('/movies',(req,res)=>{
  res.render('owner/user')
})

router.get('/user-details',(req,res)=>{
  res.render('owner/user')
})

router.get('/user-details',(req,res)=>{
  res.render('owner/user')
})
module.exports = router;
