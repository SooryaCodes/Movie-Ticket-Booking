var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { search } = require("../routes/admin");
const objectId = require("mongodb").ObjectID;

module.exports = {
  checkLogin: (mobile) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Mobile: mobile });
      if (user) {
        resolve({ userExist: true, user });
      } else {
        resolve({ userExist: false });
      }
    });
  },
  signup: (mobile, data) => {
    return new Promise((reolve, reject) => {
      data.Mobile = mobile;
      data.role = "user";
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(data)
        .then((response) => {
          reolve(response.ops[0]);
        });
    });
  },
  getMovies: () => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.MOVIE_COLLECTION)
        .find()
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getMovieDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.MOVIE_COLLECTION)
        .findOne({ _id: objectId(id) })
        .then((Movie) => {
          db.get()
            .collection(collection.OWNER_COLLECTION)
            .findOne({ _id: objectId(Movie.OwnerId) })
            .then((Owner) => {
              var d = new Date(Movie.Date);
              var n = new Date(d).getFullYear();
              Movie.Date = n;
              db.get()
                .collection(collection.SHOW_COLLECTION)
                .find({ Movie: id })
                .toArray()
                .then((Show) => {
                  resolve({ Movie, Owner, Show });
                });
            });
        });
    });
  },

  getShowScreen: (id) => {
    return new Promise(async (resolve, reject) => {
      var show = await db
        .get()
        .collection(collection.SHOW_COLLECTION)
        .findOne({ _id: objectId(id) });
      console.log(show);
      var screen=await db.get().collection(collection.SCREEN_COLLECTION).findOne({_id:objectId(show.screenId)})
      console.log(screen);
      var Vip={
        Row:screen.vipRows,
        Seat:screen.vipSeats
      }
      var Premium={
        Row:screen.premiumRows,
        Seat:screen.premiumSeats
      }
      var Normal={
        Row:screen.normalRows,
        Seat:screen.normalSeats
      }
      var Excecutive={
        Row:screen.excecutiveRows,
        Seat:screen.excecutiveSeats
      }
resolve({screen,Vip,Excecutive,Normal,Premium})
      
    });
  },
};
