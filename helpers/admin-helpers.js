var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;

module.exports = {
  // ---login---
  adminLogin: (details) => {
    return new Promise(async (resolve, reject) => {
      console.log(details);

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
};
