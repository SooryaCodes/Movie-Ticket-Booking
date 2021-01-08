var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { search } = require("../routes/admin");
const objectId = require("mongodb").ObjectID;
require("dotenv").config();
var Razorpay = require("razorpay");
const { readlink } = require("fs");
const { resolve } = require("path");
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
          var d = new Date(Movie.Date);
          var n = new Date(d).getFullYear();
          Movie.Date = n;
          console.log(Movie);
          resolve(Movie);
        });
    });
  },

  getShowScreen: (id) => {
    return new Promise(async (resolve, reject) => {
      var show = await db
        .get()
        .collection(collection.SHOW_COLLECTION)
        .findOne({ _id: objectId(id) });
      var screen = await db
        .get()
        .collection(collection.SCREEN_COLLECTION)
        .findOne({ _id: objectId(show.screenId) });
      var Vip = {
        Row: screen.vipRows,
        Seat: screen.vipSeats,
      };
      var Premium = {
        Row: screen.premiumRows,
        Seat: screen.premiumSeats,
      };
      var Normal = {
        Row: screen.normalRows,
        Seat: screen.normalSeats,
      };
      var Excecutive = {
        Row: screen.excecutiveRows,
        Seat: screen.excecutiveSeats,
      };
      resolve({ screen, Vip, Excecutive, Normal, Premium, show });
    });
  },

  generateRazorpay: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(data, userId);

      var details = {};

      details.Amount = data.total;
      details.Seat = data.seat;
      details.userId = userId;
      details.Show = data.show;
      details.Payment = data.paymentMethod
      details.ownerId = data.ownerId
      console.log(data.show, "shoe");
      console.log(details, "details");
      var showCollection = await db
        .get()
        .collection(collection.SHOW_COLLECTION)
        .updateOne(
          { _id: objectId(data.show._id) },
          {
            $push: {
              Seats: details.Seat,
            },
          }
        );
      var booking = await db
        .get()
        .collection(collection.BOOKING_COLLECTION)
        .insertOne(details);

      var bookingId = booking.ops[0]._id;

      var options = {
        amount: details.Amount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + bookingId,
      };
      console.log(options);
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log(order);
          resolve(order);
        }
      });
    });
  },

  insertBooking: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(data, userId);

      var details = {};

      details.Amount = data.total;
      details.Seat = data.seat;
      details.userId = userId;
      details.Show = data.show;
      details.Payment = data.paymentMethod
      details.ownerId = data.ownerId


      console.log(details, "details");

      var booking = await db
        .get()
        .collection(collection.BOOKING_COLLECTION)
        .insertOne(details);

      var bookingId = booking.ops[0]._id;
      resolve(details, bookingId);
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      var hash = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);

      hash.update(
        details["payment[razorpay_order_id]"] +
        "|" +
        details["payment[razorpay_payment_id]"]
      );
      hash = hash.digest("hex");
      if (hash === details["payment[razorpay_signature]"]) {
        db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(details['order[receipt]']) }, {
          $set: {
            Payment_Status: 'Paid'
          }
        }).then((response) => {
          console.log(response, 'response');
          resolve({ status: true });
        })
      } else {
        db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(details['order[receipt]']) }, {
          $set: {
            Payment_Status: 'Pending'
          }
        }).then((anotherresponse) => {
          console.log(anotherresponse, 'anotherresponse')
          resolve({ status: false });
        })
      }
    });
  },
  generatePaypal: (order, id) => {
    return new Promise((resolve, reject) => {
      console.log(order);
      var average =
        order.Show.Vip +
        order.Show.Excecutive +
        order.Show.Premium +
        order.Show.Normal;
      console.log(average / 4 * order.Seat.length);
      // console.log(average);
      var paypal = require("paypal-rest-sdk");
      paypal.configure({
        mode: "sandbox", //sandbox or live
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_SECRET,
      });
      console.log(order.Amount);
      var create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:3000",
          cancel_url: "http://localhost:3000/failure",
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: "Movie Ticket",
                  sku: id,
                  price: order.Amount,
                  currency: "INR",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "INR",
              total: order.Amount
            },

            description: "This is the payment description.",
          },
        ],

      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.log(error);
          throw error;
        } else {
          console.log("Create Payment Response");
          // console.log(payment);
          resolve(payment);
        }
      });
    });
  },

  getTheaterDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      var shows = await db
        .get()
        .collection(collection.SHOW_COLLECTION)
        .find({ Movie: id })
        .toArray();
      console.log(shows);
      var ownerDetails = [];
      for (var i = 0; i < shows.length; i++) {
        ownerDetails[i] = await db
          .get()
          .collection(collection.OWNER_COLLECTION)
          .findOne({ _id: objectId(shows[i].ownerId) });
      }
      console.log(ownerDetails);
      resolve(ownerDetails);
    });
  },

  getScreenDetails: (movieId, ownerId) => {
    return new Promise(async (resolve, reject) => {
      var shows = await db
        .get()
        .collection(collection.SHOW_COLLECTION)
        .find({ ownerId: objectId(ownerId) }, { Movie: movieId })
        .toArray();
      var screenDetails = [];
      for (var i = 0; i < shows.length; i++) {
        var screenData = await db
          .get()
          .collection(collection.SCREEN_COLLECTION)
          .findOne({ _id: objectId(shows[i].screenId) });
        screenDetails[i] = screenData;
      }

      console.log(screenDetails);
      resolve(screenDetails)
    });
  },


  getShowDetails: (movieId, screenId) => {
    return new Promise(async (resolve, reject) => {
      var showsWithScreenId = await db.get().collection(collection.SHOW_COLLECTION).find({ screenId: screenId }).toArray()
      console.log(showsWithScreenId, "shows width screen id");
      var shows = await db.get().collection(collection.SHOW_COLLECTION).find({ Movie: movieId }).toArray()

      console.log(shows, "shows");
      resolve(shows)
    })
  },


  getAllMovies: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.MOVIE_COLLECTION).find().toArray().then((data) => {
        resolve(data)
      })
    })
  },
  rateMovie: (movieId, user, data) => {
    return new Promise((resolve, reject) => {
      data.Rating = parseInt(data.Rating)
      data.user = user
      data.movieId = movieId
      db.get().collection(collection.RATING_COLLECTION).insertOne(data).then((response) => {
        resolve(response)
      })
    })
  },

  getRatings: (movieId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.RATING_COLLECTION).find({ movieId: movieId }).toArray().then((response) => {
        resolve(response)
      })
    })
  },
  addLocation: (id, data) => {
    return new Promise((resolve, reject) => {

      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
        $set: {
          Latitude: data.Latitude,
          Longitude: data.Longitude
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },
  checkLocation: (data) => {
    return new Promise((resolve, reject) => {

      db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(data._id) }).then((response) => {
        console.log(response, 'respo infdk ');
        if (response.Latitude) {
          console.log('lattude und');
          resolve({ LocationExist: true })
        } else {
          console.log('no laitude');
          resolve({ LocationExist: false })
        }
      })
    })
  },

  getUserData: (id) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(id) }).then((response) => {
        resolve(response)
      })
    })
  },

  updateName: (Name, id) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
        $set: {
          Name: Name
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },
  updateMobile: (Mobile, id) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
        $set: {
          Mobile: Mobile
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },
  updateEmail: (Email, id) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
        $set: {
          Email: Email
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },

};

