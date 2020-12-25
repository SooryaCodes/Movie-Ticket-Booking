var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { search } = require("../routes/admin");
const objectId = require("mongodb").ObjectID;
require("dotenv").config();
var Razorpay=require('razorpay');
const { readlink } = require("fs");
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});
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
      var screen=await db.get().collection(collection.SCREEN_COLLECTION).findOne({_id:objectId(show.screenId)})
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
resolve({screen,Vip,Excecutive,Normal,Premium,show})
      
    });
  },

  generateRazorpay:(data,userId)=>{

    return new Promise (async(resolve,reject)=>{
      console.log(data,userId);

var details={}

details.Amount=data.total
details.Seat=data.seat
details.userId=userId
details.Show=data.show

console.log(details,"details");

var booking=await db.get().collection(collection.BOOKING_COLLECTION).insertOne(details)

var bookingId=booking.ops[0]._id


      var options = {
        amount: details.Amount*100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: ""+bookingId
      };
      console.log(options);
      instance.orders.create(options, function(err, order) {
        
        if(err){
        console.log(err);
        }else{

          console.log(order);
          resolve(order)
        }

      });

    })
  },
  verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
      const crypto = require('crypto');
      var hash = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)

      hash.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
      hash=hash.digest('hex')
      if(hash===details['payment[razorpay_signature]']){
        resolve()
      }else{
        reject()
      }
    })
  }
};
