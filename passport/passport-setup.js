const bcrypt = require("bcrypt");

// const passport = require("passport");
const LocalStrategy = require("passport-local");

var db = require("../config/connection");
var collection = require("../config/collection");

  //   //google

  var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
  var passport=require('passport')
  require("dotenv").config();
  var db = require("../config/connection");
  var collection = require("../config/collection");
const objectId = require("mongodb").ObjectID;

module.exports.initializePassport = (passport) => {


//google



  passport.use("admin-google",new GoogleStrategy({
      clientID:     process.env.GOOGLE_CLIENT_ID_ADMIN,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_ADMIN,
      callbackURL: process.env.GOOGLE_CALLBACK_URL_ADMIN,
      passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
      db.get().collection(collection.ADMIN_COLLECTION).findOne({ adminEmail: profile.email }, function (err, user) {
          console.log(user,"dgsidfgsiablifblkv");
          console.log(profile);
        return done(err, user,profile,{message:'Invalid Account'});
      });
    }
  ));

  //owner gogogle

  passport.use("owner-google",new GoogleStrategy({
      clientID:     process.env.GOOGLE_CLIENT_ID_OWNER,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_OWNER,
      callbackURL: process.env.GOOGLE_CALLBACK_URL_OWNER,
      passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        console.log(profile);
      db.get().collection(collection.OWNER_COLLECTION).findOne({ Email: profile.email }, function (err, user) {
          console.log(user,"dgsidfgsiablifblkv");
          console.log(profile);
        return done(err, user,profile,{message:'Invalid Account'});
      });
    }
  ));








  passport.use(
    "admin-local",
    new LocalStrategy(function (username, password, done) {
      console.log(username, password);
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ adminEmail: username }, function (err, user) {
          if (err) {
            return done(err, { message: "Invalid Email Or Password" });
          }

          if (!user) {
            console.log("username not ");
            return done(null, false, { message: "Incorrect Email" });
          }

          bcrypt.compare(password, user.adminPassword, (matchErr, match) => {
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
              // console.log(user,"user in strategy");
              return done(null, user);
            }
          });
        });
    })
  );




  passport.use(
    "owner-local",
    new LocalStrategy(function (username, password, done) {
      console.log(password);
      db.get()
        .collection(collection.OWNER_COLLECTION)
        .findOne({ Name: username }, function (err, user) {
          if (err) {
            return done(err, { message: "Invalid Username Or Password" });
          }

          if (!user) {
            console.log("username not ");
            return done(null, false, { message: "Incorrect username" });
          }

          bcrypt.compare(password, user.Password, (matchErr, match) => {
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
              return done(null, user);
            }
          });
        });
    })
  );




  passport.serializeUser(function (user, done) {
    console.log(user, "serialise");
    done(null, { _id: user._id, role: user.role });
  });

  passport.deserializeUser(function ({ _id, role }, done) {
    console.log(_id,role, "first");

    if (role === "admin") {
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne(
          {
            _id: objectId(_id),
          },
          function (err, user) {
            if (err) {
              throw err;
            } else {
              done(null, user);
            }
          }
        );
    } else if (role === "owner") {
      db.get()
        .collection(collection.OWNER_COLLECTION)
        .findOne(
          {
            _id: objectId(_id),
          },
          function (err, user) {
            if (err) {
              throw err;
            } else {
              done(null, user);
            }
          }
        );
    }
  });
};
