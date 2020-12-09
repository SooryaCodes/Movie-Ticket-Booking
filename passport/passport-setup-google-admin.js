var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var passport=require('passport')
require("dotenv").config();
var db = require("../config/connection");
var collection = require("../config/collection");

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
