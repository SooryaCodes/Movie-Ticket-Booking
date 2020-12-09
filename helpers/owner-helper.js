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


  addScreen:(data,id)=>{
    return new Promise((resolve,reject)=>{
      data.OwnerId=id
      db.get().collection(collection.SCREEN_COLLECTION).insertOne(data).then((response)=>{
        resolve(response)
      })
    })
  }

}
