var express = require("express");
var router = express.Router();
const adminHelper = require("../helpers/admin-helpers");

// ---verifyLogin----

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

/* GET home page. */
router.get("/", verifyLogin, function (req, res, next) {
  res.render("admin/home", { admin: true });
});

// ----get login page---
router.get("/login", (req, res) => {
  res.render("admin/login", { loginErr: req.session.loginErr });
});

// ---post login page---

router.post("/login", (req, res) => {
  adminHelper.adminLogin(req.body).then((response) => {
    if (response.status) {
      console.log(response.admin);
      req.session.loggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.loginErr = true;
      res.redirect("/admin/login");
    }
  });
});

//---post logout---

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
});

//get theater details

router.get("/theater-details", (req, res) => {
  res.render("admin/theater-details", { admin: true });
});

//get user details

router.get("/user-details", (req, res) => {
  res.render("admin/user-details", { admin: true });
});

//get update password

router.get("/update-password", verifyLogin, (req, res) => {
  res.render("admin/update-password",{passErr:req.session.passErr});
});

//post update password

router.post("/update-password", (req, res) => {
  adminHelper.updatePassword(req.body).then((response) => {
    if (response.status) {
      adminHelper.getAdminDetails().then((data) => {
        req.session.admin.adminPassword=data.adminPassword
        res.redirect("/admin");
      });
    } else {
      req.session.passErr = true;
      res.redirect("/admin/update-password");
    }
  });
});

//get edit profile

router.get('/edit-profile',(req,res)=>{
  res.render('admin/edit-profile')
})
module.exports = router;
