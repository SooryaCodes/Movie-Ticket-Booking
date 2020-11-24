var express = require("express");
var router = express.Router();
adminHelper = require("../helpers/admin-helpers");

// ---verifyLogin----

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

/* GET home page. */
router.get("/", verifyLogin,function (req, res, next) {
  res.render("admin/home",{admin:true})
});

// ----get login page---
router.get("/login", (req, res) => {
  res.render("admin/login");
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

router.get("/logout",(req,res)=>{
  req.session.destroy()
  res.redirect("/admin")
})

module.exports = router;
