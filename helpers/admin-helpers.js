var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("express");
var objectId = require("mongodb").ObjectID;

module.exports = {
  // ---login---
  adminLogin: (details) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      console.log(details.a_email, "email");
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ adminEmail: details.a_email });

      if (admin) {
        bcrypt
          .compare(details.a_password, admin.adminPassword)
          .then((status) => {
            if (status) {
              console.log("Admin Login SuccessFull");
              response.admin = admin;
              response.status = true;
              resolve(response);
            } else {
              console.log("Admin Login Failed");
              resolve({ status: false });
            }
          });
      } else {
        console.log("Admin Login Failed Failed");
        resolve({ status: false });
      }
    });
  },

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

  getAdminDetails:()=>{
    return new Promise ((resolve,reject)=>{
      db.get().collection(collection.ADMIN_COLLECTION).find().toArray().then((data)=>{
        resolve(data[0])
      })
    })
  },


  //edit profile

  editProfile:(id,details)=>{
    return new Promise ((resolve,reject)=>{
      db.get().collection(collection.ADMIN_COLLECTION).updateOne(
        {_id:objectId(id)},
        {
          $set:{
            name:details.name
          }
        }
      ).then((response)=>{
        resolve(response)
      })
    })   
  },

  addOwner:(owner)=>{
    return new Promise (async(resolve,reject)=>{
      owner.Password=await bcrypt.hash(owner.Password,10)
      db.get().collection(collection.OWNER_COLLECTION).insertOne(owner).then((response)=>{
        console.log(response.ops[0]);
        resolve(response.ops[0])
      })
    })
  }
};
