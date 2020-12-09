// const bcrypt = require("bcrypt");

// const passport = require("passport");
// const LocalStrategy = require("passport-local");

// var db = require("../config/connection");
// var collection = require("../config/collection");

// passport.serializeUser(function (admin, done) {
//   db.get().collection(collection.ADMIN_COLLECTION).findOne({_id:admin._id,role:"admin"}).then((admin)=>{
//     done(null, admin);
  
//   })
//   });
//   passport.deserializeUser(function (admin, done) {
//     db.get()
//     .collection(collection.ADMIN_COLLECTION)
//     .findOne(
//       {
//         _id: admin._id,
//         role:'admin'
//       },
//       function (err, admin) {
//         done(err, admin);
//       }
//       );
//   });
// passport.use(
//   "admin-local",
//   new LocalStrategy(function (username, password, done) {
//     console.log(username, password);
//     db.get()
//       .collection(collection.ADMIN_COLLECTION)
//       .findOne({ adminEmail: username }, function (err, admin) {
//         if (err) {
//           return done(err, { message: "Invalid Email Or Password" });
//         }

//         if (!admin) {
//           console.log("username not ");
//           return done(null, false, { message: "Incorrect Email" });
//         }

//         bcrypt.compare(password, admin.adminPassword, (matchErr, match) => {
//           console.log(match);
//           if (matchErr) {
//             console.log("password inccorredt");
//             return done(null, false, { message: "Incorrect Password" });
//           }
//           if (!match) {
//             console.log("password inccorredt");
//             return done(null, false, { message: "Incorrect Password" });
//           }
//           if (match) {
//             return done(null, admin);
//           }
//         });
//       });
//   })
// );
