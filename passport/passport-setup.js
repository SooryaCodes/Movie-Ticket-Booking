const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// const passport = require("passport");
const LocalStrategy = require("passport-local");
const FacebookStrategy = require("passport-facebook");
var db = require("../config/connection");
var collection = require("../config/collection");

//   //google

var GoogleStrategy = require("passport-google-oauth2").Strategy;
var passport = require("passport");
require("dotenv").config();
var db = require("../config/connection");
var collection = require("../config/collection");
const flash = require("express-flash");
const objectId = require("mongodb").ObjectID;
const userHelpers = require("../helpers/user-helpers");

module.exports.initializePassport = (passport) => {
  //google

  passport.use(
    "admin-google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID_ADMIN,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_ADMIN,
        callbackURL: process.env.GOOGLE_CALLBACK_URL_ADMIN,
        passReqToCallback: true,
      },
      function (request, accessToken, refreshToken, profile, done) {
        db.get()
          .collection(collection.ADMIN_COLLECTION)
          .findOne({ adminEmail: profile.email }, function (err, user) {
            if (err) {
              return null, false, { message: "Invalid Account" };
            } else {
              return done(null, user, profile);
            }
          });
      }
    )
  );

  //owner gogogle

  passport.use(
    "owner-google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID_OWNER,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_OWNER,
        callbackURL: process.env.GOOGLE_CALLBACK_URL_OWNER,
        passReqToCallback: true,
      },
      function (request, accessToken, refreshToken, profile, done) {
        console.log(profile);
        db.get()
          .collection(collection.OWNER_COLLECTION)
          .findOne({ Email: profile.email }, function (err, user) {
            console.log(user, "dgsidfgsiablifblkv");
            console.log(profile);
            if (err) {
              return null, false, { message: "Invalid Account" };
            } else {
              return done(null, user, profile);
            }
          });
      }
    )
  );

  //user gogogle

  passport.use(
    "user-google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID_USER,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_USER,
        callbackURL: process.env.GOOGLE_CALLBACK_URL_USER,
        passReqToCallback: true,
      },
      function (request, accessToken, refreshToken, profile, done) {
        console.log(profile);
        db.get()
          .collection(collection.USER_COLLECTION)
          .findOne({ Email: profile.email })
          .then((user) => {
            if (user) {
              db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(user._id) }, {
                $set: {
                  signup: false
                }
              }).then((anotherResponseResponse) => {
                db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(user._id) }).then((originalUser) => {
                  console.log(originalUser);
                  return done(null, originalUser);
                })
              })
            } else {
              var userData = {};
              userData.Name = profile.displayName;
              userData.Email = profile.email;
              userData.role = "user";
              userData.signup = true
              userData.Wallet=0
              userData.Date=new Date()

              db.get()
                .collection(collection.USER_COLLECTION)
                .insertOne(userData)
                .then((response) => {
                  let token = jwt.sign(response.ops[0], process.env.USER_SECRET);
                  response.ops[0].My_Referal = token
                  userHelpers.insertToken(response.ops[0]._id, token).then((anotherResponse) => {
                    return done(null, response.ops[0]);
                  })
                });
            }
          });

      }
    )
  );

  //user facebook

  passport.use(
    "user-facebook",
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID_USER,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET_USER,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL_USER,
        profileFields: ["id", "displayName", "photos", "email"],
      },
      function (accessToken, refreshToken, profile, cb) {
        console.log(profile, "profile");
        return cb(null, profile);
      }
    )
  );
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
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    if (user.role === "admin") {
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne(
          {
            _id: objectId(user._id),
          },
          function (err, user) {
            if (err) {
              console.log("err");
              throw err;
            } else {
              done(null, user);
            }
          }
        );
    } else if (user.role === "owner") {
      db.get()
        .collection(collection.OWNER_COLLECTION)
        .findOne(
          {
            _id: objectId(user._id),
          },
          function (err, user) {
            if (err) {
              throw err;
            } else {
              done(null, user);
            }
          }
        );
    } else if (user.role === "user") {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne(
          {
            _id: objectId(user._id),
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
