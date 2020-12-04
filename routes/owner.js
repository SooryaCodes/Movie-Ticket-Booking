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

module.exports = router;
