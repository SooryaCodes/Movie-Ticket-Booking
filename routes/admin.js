var express = require("express");
var router = express.Router();
adminHelper = require("../helpers/admin-helpers");

// ---verifyLogin----

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", function (req, res, next) {});

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
      res.redirect("/");
    } else {
      req.session.loginErr = true;
      res.redirect("/admin/login");
    }
  });
});

module.exports = router;
