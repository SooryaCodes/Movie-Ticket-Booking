var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;


module.exports = {
    // adminLogin:(admin)=>{
    //     return new Promise ((resolve,reject)=>{
    //         admin.Password = await bcrypt.hash(admin.Password, 10);
    //         db.get()
    //     })
    // }
}