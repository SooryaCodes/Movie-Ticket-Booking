var express = require('express');
var router = express.Router();
adminHelper=require("../helpers/admin-helpers")
/* GET home page. */
router.get('/', function(req, res, next) {

});

router.get("/login",(req,res)=>{
  console.log(admin);
res.render("admin/login")
})

router.post("/login",(req,res)=>{
  adminHelper.adminLogin(req.body).then(()=>{
    res.redirect("/")
  })
})

module.exports = router;
