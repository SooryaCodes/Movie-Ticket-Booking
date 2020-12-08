var express = require("express");
var router = express.Router();
const adminHelper = require("../helpers/admin-helpers");
require("dotenv").config();
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const { response } = require("express");
const Swal = require("sweetalert2");
const bcrypt = require("bcrypt");

const passport = require("passport");
const LocalStrategy = require("passport-local");

var db = require("../config/connection");
var collection = require("../config/collection");

// // ------
const verifyLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.set(
      "Cache-Control",
      "no-cache , private,no-store,must-revalidate,post-check=0,pre-check=0"
    );
    return next();
  } else {
    res.redirect("/admin/login");
  }
};

var ownersLength = {
  oLength: "",
};
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

/* GET home page. */
router.get("/", verifyLogin, function (req, res, next) {
  console.log(ownersLength, "skbskb");
  adminHelper.getAdminDetails().then((adminDetails) => {
    adminHelper.getOwnerDetails().then((details) => {
      ownersLength.oLength = details.length;

      console.log(details.length, "length");
      if (details.length < 1) {
        res.render("admin/homeOwnerdetailsDummy", {
          admin: true,
          ownersLength,
          adminDetails: req.session.admin,
          owner: details,
        });
      } else {
        res.render("admin/home", {
          admin: true,
          ownersLength,
          adminDetails,
          ownerDetails: details,
        });
      }
    });
  });
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    res.set(
      "Cache-Control",
      "no-cache , private,no-store,must-revalidate,post-check=0,pre-check=0"
    );
    res.redirect("/admin");
  } else {
    res.render("admin/login");
  }
});

passport.serializeUser(function (admin, done) {
  done(null, admin);
});
passport.deserializeUser(function (admin, done) {
  db.get()
    .collection(collection.ADMIN_COLLECTION)
    .findOne(
      {
        _id: admin._id,
      },
      function (err, admin) {
        done(err, admin);
      }
    );
});
passport.use(
  "admin-local",
  new LocalStrategy(function (username, password, done) {
    console.log(username, password);
    db.get()
      .collection(collection.ADMIN_COLLECTION)
      .findOne({ adminEmail: username }, function (err, admin) {
        if (err) {
          return done(err, { message: "Invalid Email Or Password" });
        }

        if (!admin) {
          console.log("username not ");
          return done(null, false, { message: "Incorrect Email" });
        }

        bcrypt.compare(password, admin.adminPassword, (matchErr, match) => {
          console.log(match);
          if (matchErr) {
            console.log("password inccorredt");
            return done(null, false, { message: "Incorrect Password" });
          }
          if (!match) {
            console.log("password inccorredt");
            return done(null, false, { message: "Incorrect Password" });
          }
          if (match) {
            return done(null, admin);
          }
        });
      });
  })
);

router.post(
  "/login",
  passport.authenticate("admin-local", {
    failureRedirect: "/admin/login",
    successRedirect: "/admin",
    failureFlash: true,
  }),
  (req, res) => {
    console.log(req.body, "hey");
    res.redirect("/admin");

    // console.log(response);
  }
);

//---post logout---

router.get("/logout", verifyLogin, (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

//get theater details

router.get("/theater-details", verifyLogin, (req, res) => {
  adminHelper.getAdminDetails().then((adminDetails) => {
    res.render("admin/theater-details", {
      admin: true,
      ownersLength,
      adminDetails,
    });
  });
});

//get user details

router.get("/user-details", verifyLogin, (req, res) => {
  adminHelper.getAdminDetails().then((adminDetails) => {
    console.log(req.session.admin);
    res.render("admin/user-details", {
      admin: true,
      ownersLength,
      adminDetails,
    });
  });
});

//get update password

router.get("/update-password", verifyLogin, (req, res) => {
  adminHelper.getAdminDetails().then((adminDetails) => {
    res.render("admin/update-password", {
      admin: true,
      ownersLength,
      adminDetails: req.session.admin,
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
    res.render("admin/edit-profile", {
      admin: true,
      ownersLength,
      adminDetails: req.session.admin,
    });
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
    ownersLength.oLength = details.length;
    if (details.length < 1) {
      res.render("admin/homeOwnerdetailsDummy", {
        admin: true,
        ownersLength,
        adminDetails: req.session.admin,
        owner: details,
      });
    } else {
      res.render("admin/home", {
        admin: true,
        ownersLength,
        adminDetails: req.session.admin,
        ownerDetails: details,
      });
    }
  });
});

//add owner

router.get("/add-owner", verifyLogin, (req, res) => {
  console.log("hi");
  res.render("admin/add-owner", {
    admin: true,
    ownersLength,
    adminDetails: req.session.admin,
  });
});

//post add owner

router.post("/add-owner", async (req, res) => {
  console.log("hi");

  adminHelper.getPassword(req.body.Name).then((Password) => {
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
    adminHelper.addOwner(req.body, Password).then((response) => {
      res.render("admin/owner-image-upload", {
        id: response._id,
        admin: true,
        adminDetails: req.session.admin,
      });
    });
  });
});

//edit owner

router.get("/edit-owner/:id", verifyLogin, (req, res) => {
  var id = req.params.id.toString();

  console.log(id, "hey");
  adminHelper.getOwner(id).then((data) => {
    res.render("admin/edit-owner", {
      admin: true,
      ownersLength,
      data,
      adminDetails: req.session.admin,
    });
  });
});

//post edit owner

router.post("/edit-owner/:id", (req, res) => {
  var id = req.params.id;
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
      res.render("admin/edit-owner-image-upload", {
        id,
        adminDetails: req.session.admin,
        admin: true,
      });
    });
});
// edit owner image upload
router.post("/edit-owner-image-upload/:id", (req, res) => {
  res.json({ status: true });
  var id = req.params.id;
  var image = req.files.croppedImage;
  image.mv("./public/images/owner/profile/owner" + id + ".jpg");
  console.log(req.body);
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

router.post("/owner-image-upload/:id", (req, res) => {
  res.json({ status: true });
  var id = req.params.id;
  var image = req.files.croppedImage;
  image.mv("./public/images/owner/profile/owner" + id + ".jpg");
  console.log(req.body);
});
//bookings

router.get("/bookings", verifyLogin, (req, res) => {
  res.render("admin/booking", {
    admin: true,
    ownersLength,
    adminDetails: req.session.admin,
  });
});

//movies

router.get("/movies", verifyLogin, (req, res) => {
  res.render("admin/movie", {
    admin: true,
    ownersLength,
    adminDetails: req.session.admin,
  });
});

// router.post('/search',(req,res)=>{
//   adminHelper.getSearch(req.body).then((response)=>{
//     console.log(response);
//     console.log(response);
//     res.render('admin/home',{ admin: true ,ownersLength, adminDetails: req.session.admin ,ownerDetails:response})
//   })
// })
module.exports = router;
