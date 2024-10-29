const express = require("express");
const AuthController = require("../controllers/authController");
const router = express.Router();
const restric = require("../middleware/restrict")

router.post('/register', AuthController.register)

router.post('/login', AuthController.login)

router.get('/authenticate', restric, AuthController.authenticated)


module.exports = router;