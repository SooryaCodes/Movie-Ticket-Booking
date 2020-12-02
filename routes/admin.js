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
  adminHelper.getAdminDetails().then((adminDetails) => {
    console.log(req.session.admin);
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
      console.log(response.admin);
      req.session.loggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.loginErr = true;
      res.redirect('/admin/login')
    }
  });
});

//---post logout---

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
});

//get theater details

router.get("/theater-details",verifyLogin, (req, res) => {
  adminHelper.getAdminDetails().then((adminDetails) => {
    console.log(req.session.admin);
    res.render("admin/theater-details", { admin: true, adminDetails });
  });
});

//get user details

router.get("/user-details", verifyLogin,(req, res) => {
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


router.get('/owner-details',verifyLogin,(req,res)=>{
  res.render('admin/home',{admin:true,adminDetails:req.session.admin})
})


module.exports = router;
