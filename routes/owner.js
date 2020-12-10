var express = require("express");
var router = express.Router();
const ownerHelper = require("../helpers/owner-helper");
const adminHelper = require("../helpers/admin-helpers");
const bcrypt = require("bcrypt");

const passport = require("passport");
const LocalStrategy = require("passport-local");

var db = require("../config/connection");
var collection = require("../config/collection");
const { getMovies } = require("../helpers/owner-helper");
const { response } = require("express");
const verifyLogin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "owner") {
    next();
  } else {
    res.redirect("/owner/login");
  }
};
const verifyLoginGoogle = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/owner/login");
  }
};

/* GET users listing. */
router.get("/", verifyLogin, function (req, res, next) {
  adminHelper.getOwnerDetails().then((details) => {
    console.log("hikjbcs");
    // console.log(req.session.passport.user);
    res.render("owner/home", { owner: true });
  });
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated() && req.user.role === "owner") {
    res.redirect("/owner");
  } else {
    res.render("owner/login");
  }
});

router.get(
  "/google",
  passport.authenticate("owner-google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("owner-google", {
    failureRedirect: "/owner/login",
    successRedirect: "/owner",
    failureFlash: true,
  }),
  function (req, res) {
    // Successful authentication, redirect home.
  }
);
router.post(
  "/login",

  passport.authenticate("owner-local", {
    failureRedirect: "/owner/login",
    successRedirect: "/owner",
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect("/owner");
    // console.log(response);
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy();
  req.logout();
  res.redirect("/owner/login");
});

router.get("/user-details", verifyLogin, (req, res) => {
  res.render("owner/user", { owner: true });
});

router.get("/screen", verifyLogin, (req, res) => {
  ownerHelper.getScreens(req.user._id).then((data) => {
    if (data.length < 1) {
      res.render("owner/screen-dummy", { owner: true });
    } else {
      console.log(data.length);
      res.render("owner/screen", { owner: true, Screen: data });
    }
  });
});

router.get("/add-screen", verifyLogin, (req, res) => {
  res.render("owner/add-screen", { owner: true });
});

router.post("/add-screen", (req, res) => {
  ownerHelper
    .addScreen(req.body, req.session.passport.user._id)
    .then((data) => {});
  res.redirect("/owner/screen");
});

router.get("/edit-screen/:id", verifyLogin, (req, res) => {
  console.log(req.params.id);
  var id = req.params.id;
  ownerHelper.getScreen(id).then((response) => {
    res.render("owner/edit-screen", { owner: true, id, screen: response });
  });
});

router.post("/edit-screen/:id", (req, res) => {
  ownerHelper.editScreen(req.params.id, req.body).then((response) => {
    console.log(response);
    res.redirect("/owner/screen");
  });
});

router.post("/delete-screen/:id", (req, res) => {
  ownerHelper.deleteScreen(req.params.id).then((response) => {
    console.log(response, "delete");
    res.json({ status: true });
  });
});
router.get("/bookings", verifyLogin, (req, res) => {
  res.render("owner/bookings", { owner: true });
});

router.get("/screen/schedule", verifyLogin, (req, res) => {
  res.render("owner/schedule", { owner: true });
});

router.get("/movies", verifyLogin, (req, res) => {
  console.log(req.user);
  ownerHelper.getMovies(req.user._id).then((details) => {
    console.log(details);
    if (details.length < 1) {
      res.render("owner/movie-dummy", { owner: true });
    } else {
      res.render("owner/movie", { owner: true, movie: details });
    }
  });
});
router.post("/add-movie", (req, res) => {
  ownerHelper.addMovie(req.body, req.user._id).then((response) => {
    console.log(response);
    res.render("owner/movie-image-upload", { id: req.body._id, owner: true });
  });
});

router.post("/movie-image-upload/:id", (req, res) => {
  console.log(req.files);
  var id = req.params.id;
  var image = req.files.croppedImage;
  image.mv("./public/images/owner/movie/" + id + ".jpg");
  res.json({ status: true });
});

router.get("/edit-movie/:id", verifyLogin, (req, res) => {
  ownerHelper.getMovie(req.params.id).then((response) => {
    res.render("owner/edit-movie", {
      id: req.params.id,
      owner: true,
      movie: response,
    });
  });
});

router.post("/edit-movie/:id", (req, res) => {
  var id = req.params.id;
  ownerHelper.editMovie(req.body, id).then((response) => {
  });
  res.render("owner/edit-movie-image-upload",{id,owner: true });
});

  router.post("/edit-movie-image-upload/:id", (req, res) => {
    if (req.files.croppedImage) {
      var id = req.params.id;
      var image = req.files.croppedImage;
      image.mv("./public/images/owner/movie/" + id + ".jpg");
      res.json({ status: true });
    }
  });


  



  //upcoming movie

  
  router.post("/add-movie", (req, res) => {
    ownerHelper.addMovie(req.body, req.user._id).then((response) => {
      console.log(response);
      res.render("owner/movie-image-upload", { id: req.body._id, owner: true });
    });
  });
  
  router.post("/movie-image-upload/:id", (req, res) => {
    console.log(req.files);
    var id = req.params.id;
    var image = req.files.croppedImage;
    image.mv("./public/images/owner/movie/" + id + ".jpg");
    res.json({ status: true });
  });
  
  router.get("/edit-movie/:id", verifyLogin, (req, res) => {
    ownerHelper.getMovie(req.params.id).then((response) => {
      res.render("owner/edit-movie", {
        id: req.params.id,
        owner: true,
        movie: response,
      });
    });
  });
  
  router.post("/edit-movie/:id", (req, res) => {
    var id = req.params.id;
    ownerHelper.editMovie(req.body, id).then((response) => {
    });
    res.render("owner/edit-movie-image-upload",{id,owner: true });
  });
  
    router.post("/edit-movie-image-upload/:id", (req, res) => {
      if (req.files.croppedImage) {
        var id = req.params.id;
        var image = req.files.croppedImage;
        image.mv("./public/images/owner/movie/" + id + ".jpg");
        res.json({ status: true });
      }
    });
  

router.post('/delete-movie/:id',(req,res)=>{
  ownerHelper.deleteMovie(req.params.id).then((response)=>{
    res.json({status:true})
  })
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

router.get("/edit-profile", verifyLogin, (req, res) => {
  res.render("owner/edit-profile", { owner: true });
});






module.exports = router;
