var express = require("express");
var router = express.Router();
const adminHelper = require("../helpers/admin-helpers");
require("dotenv").config();
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

//nodemailer

let mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL, // generated ethereal user
    pass: process.env.MY_PASSWORD, // generated ethereal password
  },
});

var options = {
  viewEngine: {
      extname: '.hbs',
      layoutsDir: 'views/email/',
      defaultLayout : 'layout',
  },
  viewPath: 'views/email/'
}

mailer.use('compile', hbs(options));

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
  adminHelper.getAdminDetails().then((adminDetails) => {
    res.render("admin/home", { admin: true, adminDetails });
  });
});

// ----get login page---
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/admin");
  } else {
    res.render("admin/login", { loginErr: req.session.loginErr });
  }
});

// ---post login page---

router.post("/login", (req, res) => {
  adminHelper.adminLogin(req.body).then((response) => {
    if (response.status) {
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

router.get("/theater-details", verifyLogin, (req, res) => {
  adminHelper.getAdminDetails().then((adminDetails) => {
    res.render("admin/theater-details", { admin: true, adminDetails });
  });
});

//get user details

router.get("/user-details", verifyLogin, (req, res) => {
  adminHelper.getAdminDetails().then((adminDetails) => {
    console.log(req.session.admin);
    res.render("admin/user-details", { admin: true, adminDetails });
  });
});

//get update password

router.get("/update-password", verifyLogin, (req, res) => {
  adminHelper.getAdminDetails().then((adminDetails) => {
    res.render("admin/update-password", {
      admin: true,
      adminDetails,
      passErr: req.session.passErr,
    });
  });
});

//post update password

router.post("/update-password", (req, res) => {
  adminHelper.updatePassword(req.body).then((response) => {
    if (response.status) {
      adminHelper.getAdminDetails().then((data) => {
        req.session.admin.adminPassword = data.adminPassword;
        res.redirect("/admin");
      });
    } else {
      req.session.passErr = true;
      res.redirect("/admin/update-password");
    }
  });
});

//get edit profile

router.get("/edit-profile", verifyLogin, (req, res) => {
  adminHelper.getAdminDetails().then((adminDetails) => {
    res.render("admin/edit-profile", { admin: true, adminDetails });
  });
});

//post edit profile

router.post("/edit-profile/:id", (req, res) => {
  let id = req.params.id;
  adminHelper.editProfile(id, req.body).then((data) => {
    res.redirect("/admin");
    if (req.files.image) {
      let Image = req.files.image;
      // console.log(Image);
      console.log(data, "data");
      Image.mv("./public/images/admin/profile/" + id + ".jpg");
      console.log("exist");
    }
  });
});

//---owner-details---

router.get("/owner-details", verifyLogin, (req, res) => {
  res.render("admin/home", { admin: true, adminDetails: req.session.admin });
});

//add owner

router.get("/add-owner", verifyLogin, (req, res) => {
  console.log("hi");
  res.render("admin/add-owner", {
    admin: true,
    adminDetails: req.session.admin,
  });
});

//post add owner

router.post("/add-owner", async (req, res) => {
  console.log("hi");
  res.redirect("/admin/add-owner");
  console.log(req.body);
  const mailOptions = {
    from: process.env.MY_EMAIL, // sender address
    to: req.body.Email, // list of receivers
    subject: "Congradulation", // Subject line
    text: `hi there`,
    template:"index",
    context:{
      name:req.body.Name,
      password:req.body.Password,
      theater:req.body.Theater
    }
  };
  mailer.sendMail(mailOptions, function (err, response) {
    if (err) {
      console.log(":( bad email", err, response);
    } else {
      console.log(":) good email");
    }
  });
});

//bookings

router.get("/bookings", verifyLogin, (req, res) => {
  res.render("admin/booking", { admin: true, adminDetails: req.session.admin });
});

//movies

router.get("/movies", verifyLogin, (req, res) => {
  res.render("admin/booking", { admin: true, adminDetails: req.session.admin });
});

module.exports = router;
