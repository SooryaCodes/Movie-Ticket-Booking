

var express = require("express");
var router = express.Router();
const adminHelper = require("../helpers/admin-helpers");
require("dotenv").config();
const hbs = require("nodemailer-express-handlebars");
const { response } = require("express");
const Swal = require("sweetalert2");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mailHelper = require('../helpers/mail-helper')

const verifyLogin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    next()
  } else {
    res.redirect('/admin/login')
  }
}



router.get('/popup', (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.messages = { error: 'Invalid Account' }
  }
  res.render('admin/auth-popup-callback', { layout: false });
});



var ownersLength = {
  oLength: "",
};
//nodemailer



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
          adminDetails: req.user,
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
  if (req.isAuthenticated() && req.user.role === "admin") {
    res.set(
      "Cache-Control",
      "no-cache , private,no-store,must-revalidate,post-check=0,pre-check=0"
    );
    res.redirect("/admin");
  } else {
    res.render("admin/login", { messages: req.session.messages });
  }
});





router.get('/google', passport.authenticate('admin-google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('admin-google', { failureRedirect: '/admin/popup', successRedirect: '/admin/popup', failureFlash: true }),
  function (req, res) {
    // Successful authentication, redirect home.
    if (req.isAuthenticated()) {

      res.redirect('/admin');
    } else {
      res.redirect('/admin/login')
    }
  }
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
  req.logout()
  res.redirect("/admin/login");
});

//get theater details

router.get("/theater-details", verifyLogin, (req, res) => {
  adminHelper.getTheaterDetails().then((response) => {
    console.log(response);
    if(response.length<1){
      res.render("admin/theater-details-dummy", {
        admin: true,
        ownersLength,
        adminDetails: req.user,
      }); 
    }
    res.render("admin/theater-details", {
      admin: true,
      ownersLength,
      adminDetails: req.user,
      Theater: response
    });
  })
});

//get user details

router.get("/user-details", verifyLogin, async (req, res) => {
  var UserDetails = await adminHelper.getUserDetails()
  if (UserDetails.length < 1) {
    res.render('admin/user-details-dummy', {
      admin: true,
      ownersLength,
      adminDetails: req.user,
    })
  }
  res.render("admin/user-details", {
    admin: true,
    ownersLength,
    adminDetails: req.user,
    UserDetails
  });
});




router.get('/user-activity', async (req, res) => {
  var UserDetails = await adminHelper.getUserActivity()

  if (UserDetails.length < 1) {
    res.render('admin/user-activity-dummy', {
      admin: true,
      ownersLength,
      adminDetails: req.user,
    })
  }
  res.render('admin/user-activity', {
    admin: true,
    adminDetails: req.user,
    ownersLength,
    UserDetails

  })
})

//get update password

router.get("/update-password", verifyLogin, (req, res) => {
  adminHelper.getAdminDetails().then((adminDetails) => {
    res.render("admin/update-password", {
      admin: true,
      ownersLength,
      adminDetails: req.user,
      passErr: req.session.passErr,
    });
  });
});

//post update password

router.post("/update-password", verifyLogin, (req, res) => {
  adminHelper.updatePassword(req.body).then((response) => {
    if (response.status) {
      adminHelper.getAdminDetails().then((data) => {
        req.user.adminPassword = data.adminPassword;
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
      adminDetails: req.user,
    });
  });
});

//post edit profile

router.post("/edit-profile/:id", verifyLogin, (req, res) => {
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
        adminDetails: req.user,
        owner: details,
      });
    } else {
      res.render("admin/home", {
        admin: true,
        ownersLength,
        adminDetails: req.user,
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
    adminDetails: req.user,
  });
});

//post add owner

router.post("/add-owner", async (req, res) => {
  console.log("hi");

  adminHelper.getPassword(req.body.Name).then((Password) => {
    var dynamic_template_data = {
      Username: req.body.Name,
      Password: Password,
      Theater: req.body.Theater,
      Link: 'https://moviecafe.sooryakriz.com/owner/login'
    }
    mailHelper.sendOwnerData(req.body.Email, process.env.MY_EMAIL, 'd-862cd711d1264f75a8e550d679c54fcd', dynamic_template_data)
    adminHelper.addOwner(req.body, Password).then((response) => {
      res.render("admin/owner-image-upload", {
        id: response._id,
        admin: true,
        adminDetails: req.user,
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
      adminDetails: req.user,
    });
  });
});

//post edit owner

router.post("/edit-owner/:id", verifyLogin, (req, res) => {
  var id = req.params.id;
  var OwnerPasswordNew = "";

  adminHelper.getPassword(req.body.Name).then((Password) => {
    var dynamic_template_data = {
      Username: req.body.Name,
      Password: Password,
      Link: 'https://moviecafe.sooryakriz.com/owner/login'
    }
    mailHelper.sendOwnerData(req.body.Email, process.env.MY_EMAIL, 'd-5d863e5b8623410a978fddbbdf2fa135', dynamic_template_data)
    OwnerPasswordNew = Password;



    adminHelper
      .editOwner(req.params.id, req.body, OwnerPasswordNew)
      .then((data) => {
        res.render("admin/edit-owner-image-upload", {
          id,
          adminDetails: req.user,
          admin: true,
        });
      });

  });


});
// edit owner image upload
router.post("/edit-owner-image-upload/:id", verifyLogin, (req, res) => {
  res.json({ status: true });
  var id = req.params.id;
  var image = req.files.croppedImage;
  image.mv("./public/images/owner/profile/owner" + id + ".jpg");
  console.log(req.body);
});
//delet owner

router.post("/delete-owner/:id", verifyLogin, (req, res) => {
  console.log(req.params.id);
  console.log("del");
  adminHelper.getOwner(req.params.id).then((response) => {
    adminHelper.deleteOwner(req.params.id).then(() => {
      console.log(response);

      mailHelper.sendOwnerData(response.Email, process.env.MY_EMAIL, 'd-8af10cdec85946fe92727748c72566e0')
    });

    res.json({ status: true });
  });
});
//delet user

router.post("/delete-user/:id", verifyLogin, (req, res) => {
  adminHelper.deleteUser(req.params.id).then(() => {
    res.json({ status: true });

  });

});

//post owner image upload

router.post("/owner-image-upload/:id", verifyLogin, (req, res) => {
  res.json({ status: true });
  var id = req.params.id;
  var image = req.files.croppedImage;
  image.mv("./public/images/owner/profile/owner" + id + ".jpg");
  console.log(req.body);
});



router.get('/get-bar-chart-data', (req, res) => {
  adminHelper.getBarChartData(req.user._id).then((response) => {
    // console.log(response);
    res.json(response)
  })
})


router.post('/getLineChartData', (req, res) => {
  adminHelper.getLineChartData(req.user._id).then((response) => {
    var January = response.January
    var February = response.February
    var March = response.March
    var April = response.April
    var May = response.May
    var June = response.June
    var July = response.July
    var August = response.August
    var September = response.September
    var October = response.October
    var November = response.November
    var December = response.December
    res.json({ January, February, March, April, May, June, July, August, September, October, November, December })
  })
})


module.exports = router;
