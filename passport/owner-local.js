const bcrypt = require("bcrypt");

const passport = require("passport");
const LocalStrategy = require("passport-local");

var db = require("../config/connection");
var collection = require("../config/collection");




passport.serializeUser(function (user, done) {
    db.get().collection(collection.OWNER_COLLECTION).findOne({_id:user._id,role:"owner"}).then((user)=>{
      console.log(user);
      done(null, user);
    
    })
    });
  
  
    passport.deserializeUser(function (user, done) {
      db.get()
      .collection(collection.OWNER_COLLECTION)
      .findOne(
        {
          _id: user._id,
          role:'owner'
        },
        function (err, user) {
          done(err, user);
        }
        );
    });
  passport.use(
    "owner-local",
    new LocalStrategy(
     
      function (username, password, done) {
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
      }
    )
  );
  