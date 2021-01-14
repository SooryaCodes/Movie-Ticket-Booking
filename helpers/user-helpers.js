var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { search, use } = require("../routes/admin");
const objectId = require("mongodb").ObjectID;
require("dotenv").config();
var Razorpay = require("razorpay");
const { readlink } = require("fs");
const { resolve } = require("path");
const { BOOKING_COLLECTION } = require("../config/collection");
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});
const jwt = require("jsonwebtoken");
const { decode } = require("punycode");

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
      data.Date = new Date()
      data.Wallet = 0
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
      data.WalletAmount = parseInt(data.WalletAmount)
      var details = {};
      data.total = parseInt(data.total)
      details.Amount = data.total;
      details.Seat = data.seat;
      details.userId = userId;
      details.Show = data.show;
      details.Payment = data.paymentMethod
      details.ownerId = data.ownerId
      details.Payment_Status = 'Pending'
      details.Date = new Date()
      details.PaymentStatus = false
      console.log(data.show, "shoe");
      console.log(details, "details");
      details.walletUsed = data.walletUsed
      if (data.walletUsed === true) {
        if (data.AmountIsOne === true) {
          var deleteWallet = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
            $inc: {
              Wallet: -data.total
            }
          })
        } else if (data.WalletUsedWithAmount === true) {
          var deleteWallet = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
            $inc: {
              Wallet: -data.WalletAmount
            }
          })
        }
      }


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


      if (data.AmountIsOne === true) {

        var options = {
          amount: 1 * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + bookingId,
        };

      } else if (data.WalletUsedWithAmount === true) {
        var options = {
          amount: (data.total - data.WalletAmount) * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + bookingId,
        };

      } else if (data.originalAmount === true) {
        var options = {
          amount: data.total * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + bookingId,
        };

      }









      console.log(options);
      instance.orders.create(options, function (err, order) {
        if (err) {
          throw err
        } else {
          console.log(order);
          resolve(order);
        }
      });
    });
  },



  generateRazorpayAnother: (id) => {
    return new Promise(async (resolve, reject) => {

      var booking = await db
        .get()
        .collection(collection.BOOKING_COLLECTION)
        .findOne({ _id: objectId(id) });


      var options = {
        amount: booking.Amount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + booking._id,
      };
      console.log(options);
      instance.orders.create(options, function (err, order) {
        if (err) {
          throw err
        } else {
          console.log(order);
          resolve({ Razorpay: true, order });
        }
      });
    });
  },

  insertBooking: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(data, userId);

      var details = {};

      data.total = parseInt(data.total);
      details.Amount = data.total;
      details.Seat = data.seat;
      details.userId = userId;
      details.Show = data.show;
      details.Payment = data.paymentMethod
      details.ownerId = data.ownerId
      details.Date = new Date()
      details.Payment_Status = 'Pending'
      details.PaymentStatus = false
      details.walletUsed = data.walletUsed
      if (data.walletUsed === true) {
        var deleteWallet = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
          $set: {
            Wallet: -data.total
          }
        })
      }
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
      console.log(details, "details");

      var booking = await db
        .get()
        .collection(collection.BOOKING_COLLECTION)
        .insertOne(details);

      var bookingId = booking.ops[0]._id;
      resolve({ details, bookingId });
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
            Payment_Status: 'Paid',
            PaymentStatus: true
          }
        }).then((response) => {
          console.log(response, 'response');
          resolve({ status: true });
        })
      } else {
        db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(details['order[receipt]']) }, {
          $set: {
            Payment_Status: 'Pending',
            PaymentStatus: false
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
          return_url: "https://moviecafe.sooryakriz.com/booking-success?id=" + id,
          cancel_url: "https://moviecafe.sooryakriz.com/booking-failure?id=" + id,
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


  generatePaypalAnother: (id) => {
    return new Promise(async (resolve, reject) => {
      var order = await db.get().collection(collection.BOOKING_COLLECTION).findOne({ _id: objectId(id) })
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
          return_url: "http://localhost:3000/booking-success?id=" + id,
          cancel_url: "http://localhost:3000/booking-failure?id=" + id,
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
          resolve({ Paypal: true, payment });
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
      var shows = []

for(var i=0;i<showsWithScreenId.length;i++){
  if(showsWithScreenId[i].Movie===movieId){
    shows[i]=showsWithScreenId[i]
  }
}
console.log(shows);
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
  insertToken: (id, referal) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
        $set: {
          My_Referal: referal
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },
  insertRewardThisUser: (id, referal) => {
    return new Promise((reolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
        $inc: {
          Wallet: 50
        }
      }).then((response) => {
        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {

          $set: {
            Referal_Used: referal
          }
        }).then((anotherresponse) => {
          db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
            $push: {
              Rewards: 50
            }
          }).then((anotherresponseresponse) => {
            resolve(response)
          })

        })
      })
    })
  },
  getWallet: (id) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(id) }).then((data) => {
        if (data.Wallet) {
          resolve(data)
        } else {
          resolve({ status: false })
        }
      })
    })
  },
  getBookings: (id) => {
    console.log(typeof (id));
    console.log(id);
    return new Promise(async (resolve, reject) => {
      var bookingsDetails = await db.get().collection(collection.BOOKING_COLLECTION).find({ userId: objectId(id) }).toArray()

      for (var i = 0; i < bookingsDetails.length; i++) {
        var show = await db.get().collection(collection.SHOW_COLLECTION).findOne({ _id: objectId(bookingsDetails[i].Show._id) })
        bookingsDetails[i].ShowsDetails = show

        var theater = await db.get().collection(collection.OWNER_COLLECTION).findOne({ _id: objectId(bookingsDetails[i].ShowsDetails.ownerId) })

        bookingsDetails[i].Theater = theater
      }

      console.log(bookingsDetails);
      resolve(bookingsDetails)
    })
  },

  changeStatus: (id, userId) => {

    return new Promise(async (resolve, reject) => {
      var userData = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
      var thisUserBookings = await db.get().collection(collection.BOOKING_COLLECTION).find({ userId: objectId(userId) }).toArray()
      if (thisUserBookings.length === 1) {
        jwt.verify(userData.Referal_Used, process.env.USER_SECRET, async (err, decoded) => {
          if (err) {
            console.log("I don't know :)");
          } else {
            var insertWallet = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(decoded._id) }, {
              $inc: {
                Wallet: 100
              }
            })
            var insertReward = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(decoded._id) }, {
              $push: {
                Rewards: 100
              }
            })


          }
        });

      }
      db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(id) }, {
        $set: {
          Payment_Status: 'Paid',
          PaymentStatus: true
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },
  changeStatusToPending: (id) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(id) }, {
        $set: {
          Payment_Status: 'Pending',
          PaymentStatus: false
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },
  getBookingDetail: (id) => {
    return new Promise(async (resolve, reject) => {
      var bookDetails = await db.get().collection(collection.BOOKING_COLLECTION).findOne({ _id: objectId(id) })
      var show = await db.get().collection(collection.SHOW_COLLECTION).findOne({ _id: objectId(bookDetails.Show._id) })
      var owner = await db.get().collection(collection.OWNER_COLLECTION).findOne({ _id: objectId(bookDetails.ownerId) })
      var Data = {
        Amount: bookDetails.Amount,
        Seats: bookDetails.Seat.toString(),
        Payment: bookDetails.Payment,
        Payment_Status: bookDetails.Payment_Status,
        Movie: show.MovieName,
        Screen: bookDetails.Show.screenName,
        ShowDate: show.Date,
        ShowTime: show.Time,
        Theater: owner.Theater,
        Link: 'https://moviecafe.sooryakriz.com/account',
        MovieLink: `https://moviecafe.sooryakriz.com/images/owner/movie/${bookDetails.Show.Movie}.jpg`
      }
      console.log(Data);
      resolve(Data)
    })
  },
  cancelBooking: (id, userId) => {
    return new Promise(async (resolve, reject) => {

      var bookDetails = await db.get().collection(collection.BOOKING_COLLECTION).findOne({ _id: objectId(id) })


      var deleteSeatsShow = await db.get().collection(collection.SHOW_COLLECTION).updateOne({ _id: objectId(bookDetails.Show._id) }, {
        $pull: {
          Seats: bookDetails.Seat
        }
      })

      var Amount = parseInt(bookDetails.Amount)


      var addWallet = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
        $inc: {
          Wallet: Amount
        }
      })

      var addREward = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
        $push: {
          Rewards: Amount
        }
      })
      var deleteBooking = await db.get().collection(collection.BOOKING_COLLECTION).removeOne({ _id: objectId(id) })
      resolve({ status: true })
    })
  },
  cancelBookingFailed: (id, userId) => {
    return new Promise(async (resolve, reject) => {

      var bookDetails = await db.get().collection(collection.BOOKING_COLLECTION).findOne({ _id: objectId(id) })


      var deleteSeatsShow = await db.get().collection(collection.SHOW_COLLECTION).updateOne({ _id: objectId(bookDetails.Show._id) }, {
        $pull: {
          Seats: bookDetails.Seat
        }
      })


      var deleteBooking = await db.get().collection(collection.BOOKING_COLLECTION).removeOne({ _id: objectId(id) })
      resolve({ status: true })
    })
  },


};



