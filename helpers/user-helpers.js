var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { search } = require("../routes/admin");
const objectId = require("mongodb").ObjectID;

module.exports = {
  checkLogin:(mobile)=>{
    return new Promise(async(resolve,reject)=>{
      let user=await db.get().collection(collection.USER_COLLECTION).findOne({Mobile:mobile})
      if(user){
        
        resolve({userExist:true,user})
      }else{
        resolve({userExist:false})
      }
    })
  },
  signup:(mobile,data)=>{
    return new Promise((reolve,reject)=>{
      data.Mobile=mobile
      data.role="user"
      db.get().collection(collection.USER_COLLECTION).insertOne(data).then((response)=>{
        reolve(response.ops[0])
      })
    })
  }

};
