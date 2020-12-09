var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { search } = require("../routes/admin");
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
      owner.role="owner"
      // console.log(Password, "checking");
      console.log(owner, "owner");
      owner.Password=Password
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
  getSearch: (searchKey) => {
    return new Promise((resolve, reject) => {
      console.log(searchKey.search);
      var result = db
        .get()
        .collection(collection.OWNER_COLLECTION)
        .findOne({ Name: searchKey.search });
      resolve(result);
    });
  },
};
