var express = require("express");
var router = express.Router();
const ownerHelper = require("../helpers/owner-helper");
const adminHelper = require("../helpers/admin-helpers");

/* GET users listing. */
router.get("/", function (req, res, next) {
  adminHelper.getOwnerDetails().then((details) => {
    res.render("owner/home", { owner: true });
  });
});

router.get('/login',(req,res)=>{
  res.render('owner/login')
})

router.post('/login',(req,res)=>{
  ownerHelper.ownerLogin(req.body).then((response)=>{
    console.log("chacking");
    res.send('suucceessffuullyy lllooggiinn ccoommppllleetteedd')
    // console.log(response);
  })
})
module.exports = router;
