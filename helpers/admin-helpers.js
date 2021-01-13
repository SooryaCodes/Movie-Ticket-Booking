var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");

const objectId = require("mongodb").ObjectID;
module.exports = {


  // update password

  updatePassword: (details) => {
    return new Promise(async (resolve, reject) => {
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ adminEmail: details.email });

      if (admin) {
        bcrypt
          .compare(details.oldps, admin.adminPassword)
          .then(async (status) => {
            if (status) {
              console.log("successfull");
              let newPassword = await bcrypt.hash(details.newps, 10);
              db.get()
                .collection(collection.ADMIN_COLLECTION)
                .updateOne(
                  { adminEmail: details.email },
                  {
                    $set: {
                      adminPassword: newPassword,
                    },
                  }
                );
              resolve({ status: true });
            } else {
              console.log("failed");
              resolve({ status: false });
            }
          });
      } else {
        resolve({ status: false });
      }
    });
  },

  //get admin details

  getAdminDetails: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .find()
        .toArray()
        .then((data) => {
          resolve(data[0]);
        });
    });
  },

  //edit profile

  editProfile: (id, details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          {
            $set: {
              name: details.name,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  //---generate password---

  getPassword: (name) => {
    return new Promise((resolve, reject) => {
      var chars = "12@34567891012@34567@89101234567@8910@";
      var passwordLength = 8;
      var password = "";

      for (var i = 0; i < passwordLength; i++) {
        var randomPassword = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomPassword, randomPassword + 5);
        resolve(name + password);
      }
    });
  },

  addOwner: (owner, Password) => {
    return new Promise(async (resolve, reject) => {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      newdate = year + "-" + month + "-" + day;
      owner.date = newdate;
      owner.role = "owner"
      // console.log(Password, "checking");
      console.log(owner, "owner");
      owner.Password = Password
      console.log(owner);
      owner.Password = await bcrypt.hash(Password, 10);
      console.log(owner);
      db.get()
        .collection(collection.OWNER_COLLECTION)
        .insertOne(owner)
        .then((response) => {
          console.log(response.ops[0]);
          resolve(response.ops[0]);
        });
    });
  },

  getOwnerDetails: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.OWNER_COLLECTION)
        .find()
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },

  getOwner: (OwnerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.OWNER_COLLECTION)
        .findOne({ _id: objectId(OwnerId) })
        .then((data) => {
          resolve(data);
          console.log(data, "hhhhhhhhhhhhhhhh");
        });
    });
  },
  editOwner: (id, details, Password) => {
    return new Promise(async (resolve, reject) => {
      console.log(Password, "hey guys ");
      details.Password = await bcrypt.hash(Password, 10);

      db.get()
        .collection(collection.OWNER_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          {
            $set: {
              Name: details.Name,
              Email: details.Email,
              Password: details.Password,
              Theater: details.Theater,
            },
          }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },
  deleteOwner: (OwnerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.OWNER_COLLECTION)
        .removeOne({ _id: objectId(OwnerId) })
        .then((response) => {
          console.log("success");
          resolve({ status: true });
        });
    });
  },
  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .removeOne({ _id: objectId(userId) })
        .then((response) => {
          console.log("success");
          resolve({ status: true });
        });
    });
  },

  getLineChartData: (id) => {
    return new Promise(async (resolve, reject) => {

      var myBookings = await db.get().collection(collection.BOOKING_COLLECTION).find().toArray()
      var JanuaryArray = []
      var FebruaryArray = []
      var MarchArray = []
      var AprilArray = []
      var MayArray = []
      var JuneArray = []
      var JulyArray = []
      var AugustArray = []
      var SeptemberArray = []
      var OctoberArray = []
      var NovemberArray = []
      var DecemberArray = []
      for (var i = 0; i < myBookings.length; i++) {
        myBookings[i].MonthNum = myBookings[i].Date.getMonth() + 1
      }
      var January = 0
      var February = 0
      var March = 0
      var April = 0
      var May = 0
      var June = 0
      var July = 0
      var August = 0
      var September = 0
      var October = 0
      var November = 0
      var December = 0
      for (var i = 0; i < myBookings.length; i++) {
        if (myBookings[i].MonthNum === 1) {
          JanuaryArray.push(myBookings[i].Amount)
          January = JanuaryArray.reduce((a, b) => a + b, 0)
        } else if (myBookings[i].Amount.MonthNum === 2) {
          FebruaryArray.push(myBookings[i].Amount)
          February = FebruaryArray.reduce((a, b) => a + b, 0)
        } else if (myBookings[i].Amount.MonthNum === 3) {
          MarchArray.push(myBookings[i].Amount)
          March = MarchArray.reduce((a, b) => a + b, 0)
        } else if (myBookings[i].Amount.MonthNum === 4) {
          AprilArray.push(myBookings[i].Amount)
          April = AprilArray.reduce((a, b) => a + b, 0)
        } else if (myBookings[i].Amount.MonthNum === 5) {
          MayArray.push(myBookings[i].Amount)
          May = MayArray.reduce((a, b) => a + b, 0)
        } else if (myBookings[i].Amount.MonthNum === 6) {
          JuneArray.push(myBookings[i].Amount)
          June = JuneArray.reduce((a, b) => a + b, 0)
        } else if (myBookings[i].Amount.MonthNum === 7) {
          JulyArray.push(myBookings[i].Amount)
          July = JulyArray.reduce((a, b) => a + b, 0)
        } else if (myBookings[i].Amount.MonthNum === 8) {
          AugustArray.push(myBookings[i].Amount)
          August = AugustArray.reduce((a, b) => a + b, 0)
        } else if (myBookings[i].Amount.MonthNum === 9) {
          SeptemberArray.push(myBookings[i].Amount)
          September = SeptemberArray.reduce((a, b) => a + b, 0)
        } else if (myBookings[i].Amount.MonthNum === 10) {
          OctoberArray.push(myBookings[i].Amount)
          October = OctoberArray.reduce((a, b) => a + b, 0)
        } else if (myBookings[i].Amount.MonthNum === 11) {
          NovemberArray.push(myBookings[i].Amount)
          November = NovemberArray.reduce((a, b) => a + b, 0)
        } else if (myBookings[i].Amount.MonthNum === 12) {
          DecemberArray.push(myBookings[i].Amount)
          December = DecemberArray.reduce((a, b) => a + b, 0)
        }
      }
      console.log({ January, February, March, April, May, June, July, August, September, October, November, December });
      resolve({ January, February, March, April, May, June, July, August, September, October, November, December });
    })
  },


  getBarChartData: (id) => {
    return new Promise(async (resolve, reject) => {
      var Movies = await db.get().collection(collection.MOVIE_COLLECTION).find().toArray()
      var Upcomings = await db.get().collection(collection.UPCOMING_MOVIE_COLLECTION).find().toArray()
      var Bookings = await db.get().collection(collection.BOOKING_COLLECTION).find().toArray()
      var Shows = await db.get().collection(collection.SHOW_COLLECTION).find().toArray()
      var Screens = await db.get().collection(collection.SCREEN_COLLECTION).find().toArray()
      var Users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
      var Owners = await db.get().collection(collection.OWNER_COLLECTION).find().toArray()
      resolve({ Movies, Upcomings, Bookings, Shows, Screens, Users, Bookings, Owners })
    });
  },
  getBookings: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.BOOKING_COLLECTION).find().toArray().then((response) => {
        resolve(response)
      })
    })
  },
  getTheaterDetails: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.OWNER_COLLECTION).find().toArray().then((response) => {
        for(var i=0;i<response.length;i++){
          response[i].date=new Date(response[i].date).toLocaleDateString()
        }
        resolve(response)
      })
    })
  },



  getUserActivity: (id) => {
    return new Promise(async (resolve, reject) => {
      var bookingDetails = await db.get().collection(collection.BOOKING_COLLECTION).find().toArray()
      console.log(bookingDetails);
      for (var i = 0; i < bookingDetails.length; i++) {
        bookingDetails[i].UserDetails = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(bookingDetails[i].userId) })
        bookingDetails[i].Date = await new Date(bookingDetails[i].Date).toLocaleDateString()
        bookingDetails[i].UserDetails.Date = await new Date(bookingDetails[i].UserDetails.Date).toLocaleDateString()
        if (bookingDetails[i].Payment_Status === 'Paid') {
          bookingDetails[i].Paid = true
        } else {
          bookingDetails[i].Paid = false

        }

      }
      resolve(bookingDetails)
    })
  },

  getUserDetails: () => {
    return new Promise(async (resolve, reject) => {

      var Users = await db.get().collection(collection.USER_COLLECTION).find().toArray()

      for (var i = 0; i < Users.length; i++) {
        Users[i].Date = await new Date(Users[i].Date).toLocaleDateString()


      }
      resolve(Users)
    })
  }
,





};
