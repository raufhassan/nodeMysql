const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controller/user.controller");

router.get("/test", (req, res) => res.json({ msg: "test api is working " }));
router.post("/users", UserController.create); // regiter
// router.get(
//   "/users",
//   passport.authenticate("jwt", { session: false }),
//   UserController.login
// ); // R
router.post("/users/login", UserController.login); // login api

router.post("/users/verify", UserController.verification); //email verfication
module.exports = router;
