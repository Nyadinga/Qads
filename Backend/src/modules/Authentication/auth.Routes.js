const express = require("express");
const router = express.Router();

const { validateUser } = require("./auth.Validator");
const { registerUser } = require("./auth.Controller");

router.post("/register", validateUser, registerUser);

module.exports = router;