var express = require("express");
var router = express.Router();
const adminHelper = require("../helpers/admin-helpers");
require("dotenv").config();
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const { response } = require("express");
const Swal = require("sweetalert2");

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
    extname: ".hbs",
    layoutsDir: "views/email/",
    defaultLayout: "layout",
  },
  viewPath: "views/email/",
};

mailer.use("compile", hbs(options));

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
    adminHelper.getOwnerDetails().then((details) => {
      console.log(details.length, "length");
      if (details.length < 1) {
        res.render("admin/homeOwnerdetailsDummy", {
          admin: true,
          adminDetails: req.session.admin,
          owner: details,
        });
      } else {
        res.render("admin/home", { admin: true, adminDetails, owner: details });

      }
    });
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
  adminHelper.getOwnerDetails().then((details) => {
    console.log(details.length, "length");
    if (details.length < 1) {
      res.render("admin/homeOwnerdetailsDummy", {
        admin: true,
        adminDetails: req.session.admin,
        owner: details,
      });
    } else {
      res.render("admin/home", {
        admin: true,
        adminDetails: req.session.admin,
        owner: details,
      });
    }
  });
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
  var ownerPassword = "";
  console.log(req.body);
  adminHelper.getPassword(req.body.Name).then((Password) => {
    console.log(Password, "password");
    ownerPassword = Password;
    const mailOptions = {
      from: process.env.MY_EMAIL, // sender address
      to: req.body.Email, // list of receivers
      subject: "Congradulation", // Subject line
      text: `hi there`,
      template: "index",
      context: {
        name: req.body.Name,
        password: Password,
        theater: req.body.Theater,
      },
    };
    mailer.sendMail(mailOptions, function (err, response) {
      if (err) {
        console.log(":( bad email", err, response);
      } else {
        console.log(":) good email");
      }
    });
  });

  adminHelper.addOwner(req.body, ownerPassword).then((response) => {
    res.redirect("/admin/owner-details");
  });
});

//edit owner

router.get("/edit-owner/:id", (req, res) => {
  var id = req.params.id.toString();

  console.log(id, "hey");
  adminHelper.getOwner(id).then((data) => {
    res.render("admin/edit-owner", {
      admin: true,
      data,
      adminDetails: req.session.admin,
    });
  });
});

//post edit owner

router.post("/edit-owner/:id", (req, res) => {
  var OwnerPasswordNew = "";

  adminHelper.getPassword(req.body.Name).then((Password) => {
    OwnerPasswordNew = Password;
    const mailOptions = {
      from: process.env.MY_EMAIL, // sender address
      to: req.body.Email, // list of receivers
      subject: "Login Credentials Updated", // Subject line
      template: "index-update",
      context: {
        name: req.body.Name,
        password: Password,
        theater: req.body.Theater,
      },
    };
    mailer.sendMail(mailOptions, function (err, response) {
      if (err) {
        console.log(":( bad email", err, response);
      } else {
        console.log(":) good email");
      }
    });
  });

  adminHelper
    .editOwner(req.params.id, req.body, OwnerPasswordNew)
    .then((data) => {
      res.redirect("/admin/owner-details");
    });
});
//owner image upload

router.get("/owner-image-upload", (req, res) => {
  res.render("admin/owner-image-upload", {
    admin: true,
    adminDetails: req.session.admin,
  });
});

//delet owner

router.post("/delete-owner/:id", (req, res) => {
  console.log(req.params.id);
  console.log("del");
  adminHelper.getOwner(req.params.id).then((response) => {
    adminHelper.deleteOwner(req.params.id).then(() => {
      console.log(response);
      const mailOptions = {
        from: process.env.MY_EMAIL, // sender address
        to: response.Email, // list of receivers
        subject: "Account Deleted", // Subject line
        template: "index-delete",
        context: {
          name: response.Name,
          theater: response.Theater,
        },
      };
      mailer.sendMail(mailOptions, function (err, response) {
        if (err) {
          console.log(":( bad email", err, response);
        } else {
          console.log(":) good email");
        }
      });
    });

    res.json({ status: true });
  });
});

//post owner image upload

router.post("/owner-image-upload", (req, res) => {
  console.log("success");
  console.log(req.files.image);
  console.log(req.body);
});
//bookings

router.get("/bookings", verifyLogin, (req, res) => {
  res.render("admin/booking", { admin: true, adminDetails: req.session.admin });
});

//movies

router.get("/movies", verifyLogin, (req, res) => {
  res.render("admin/movie", { admin: true, adminDetails: req.session.admin });
});

module.exports = router;
