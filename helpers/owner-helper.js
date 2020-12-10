var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { static, response } = require("express");
const objectId = require("mongodb").ObjectID;
module.exports = {
  // // ---login---
  // ownerLogin: (details) => {
  //   return new Promise(async (resolve, reject) => {
  //     let loginStatus = false;
  //     let response = {};
  //     let owner = await db
  //       .get()
  //       .collection(collection.OWNER_COLLECTION)
  //       .findOne({ Name: details.username });
  //     if (owner) {
  //       bcrypt.compare(details.password,owner.Password).then((status) => {
  //         if (status) {
  //           console.log("owner Login SuccessFull");
  //           response.owner = owner;
  //           response.status = true;
  //           resolve(response);
  //         } else {
  //           console.log("owner Login Failed");
  //           resolve({ status: false });
  //         }
  //       });
  //     } else {
  //       console.log("owner Login Failed Failed");
  //       resolve({ status: false });
  //     }
  //   });
  // },

  // update password

  //   updatePassword: (details) => {
  //     return new Promise(async (resolve, reject) => {
  //       let owner = await db
  //         .get()
  //         .collection(collection.OWNER_COLLECTION)
  //         .findOne({ username: details.email });

  //       if (owner) {
  //         bcrypt
  //           .compare(details.oldps, owner.adminPassword)
  //           .then(async (status) => {
  //             if (status) {
  //               console.log("successfull");
  //               let newPassword = await bcrypt.hash(details.newps, 10);
  //               db.get()
  //                 .collection(collection.OWNER_COLLECTION)
  //                 .updateOne(
  //                   { username: details.username },
  //                   {
  //                     $set: {
  //                       Password: details.password,
  //                     },
  //                   }
  //                 );
  //               resolve({ status: true });
  //             } else {
  //               console.log("failed");
  //               resolve({ status: false });
  //             }
  //           });
  //       } else {
  //         resolve({ status: false });
  //       }
  //     });
  //   },

  // verifyPassword:(password,user)=>{
  //   return new Promise ((resolve,reject)=>{
  //     bcrypt.compare(password,user.Password).then((status)=>{
  //       console.log(status);
  //       resolve(status)
  //     })
  //   })
  // }

  getScreens: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.SCREEN_COLLECTION)
        .find({ OwnerId: objectId(id) })
        .toArray()
        .then((response) => {
          console.log(response, "screen");
          resolve(response);
        });
    });
  },
  addScreen: (data, id) => {
    return new Promise((resolve, reject) => {
      data.OwnerId = id;
      db.get()
        .collection(collection.SCREEN_COLLECTION)
        .insertOne(data)
        .then((response) => {
          resolve(response);
        });
    });
  },
  editScreen: (id, data) => {
    return new Promise((resolve, reject) => {
      console.log(data);
      db.get()
        .collection(collection.SCREEN_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          {
            $set: {
              Name: data.Name,
              Seat: data.Seat,
            },
          }
        )
        .then((response) => {
          resolve(response);
          console.log(response);
        });
    });
  },
  deleteScreen: (screenId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.SCREEN_COLLECTION)
        .removeOne({ _id: objectId(screenId) })
        .then((response) => {
          console.log("success");
          resolve({ status: true });
        });
    });
  },
  getScreen: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.SCREEN_COLLECTION)
        .findOne({ _id: objectId(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  addMovie: (data, id) => {
    return new Promise((resolve, reject) => {
      data.OwnerId = id;
      db.get()
        .collection(collection.MOVIE_COLLECTION)
        .insertOne(data)
        .then((response) => {
          resolve(response);
        });
    });
  },

  getMovies: (id) => {
    console.log(id);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.MOVIE_COLLECTION)
        .find({ OwnerId: objectId(id) })
        .toArray()
        .then((response) => {
          console.log(response, "screen");
          resolve(response);
        });
    });
  },

  editMovie: (data, id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.MOVIE_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          {
            $set: {
              Title: data.Title,
              Cast: data.Cast,
              Director: data.Director,
              Date: data.Date,
              Category: data.Category,
              Trailer: data.Trailer,
              Runtime: data.Runtime,
            },
          }
        );
    });
  },
  getMovie:(id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.MOVIE_COLLECTION)
        .findOne({ _id: objectId(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  deleteMovie: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.MOVIE_COLLECTION)
        .removeOne({ _id: objectId(id) })
        .then((response) => {
          console.log("success");
          resolve({ status: true });
        });
    });
  },

  //upcoming movie

  addUpcomingMovie: (data, id) => {
    return new Promise((resolve, reject) => {
      data.OwnerId = id;
      db.get()
        .collection(collection.UPCOMING_MOVIE_COLLECTION)
        .insertOne(data)
        .then((response) => {
          resolve(response);
        });
    });
  },

  getUpcomingMovies: (id) => {
    console.log(id);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.UPCOMING_MOVIE_COLLECTION)
        .find({ OwnerId: objectId(id) })
        .toArray()
        .then((response) => {
          console.log(response, "screen");
          resolve(response);
        });
    });
  },

  editUpcomingMovie: (data, id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.UPCOMING_MOVIE_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          {
            $set: {
              Title: data.Title,
              Cast: data.Cast,
              Director: data.Director,
              Date: data.Date,
              Category: data.Category,
              Trailer: data.Trailer,
              Runtime: data.Runtime,
            },
          }
        );
    });
  },
  getUpcomingMovie:(id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.UPCOMING_MOVIE_COLLECTION)
        .findOne({ _id: objectId(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  deleteUpcomingMovie: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.UPCOMING_MOVIE_COLLECTION)
        .removeOne({ _id: objectId(id) })
        .then((response) => {
          console.log("success");
          resolve({ status: true });
        });
    });
  },
};
