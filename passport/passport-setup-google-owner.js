var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var passport=require('passport')
require("dotenv").config();
var db = require("../config/connection");
var collection = require("../config/collection");

passport.use("owner-google",new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID_OWNER,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_OWNER,
    callbackURL: process.env.GOOGLE_CALLBACK_URL_OWNER,
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    db.get().collection(collection.OWNER_COLLECTION).findOne({ Email: profile.email }, function (err, user) {
        console.log(user,"dgsidfgsiablifblkv");
        console.log(profile);
      return done(err, user,profile,{message:'Invalid Account'});
    });
  }
));
