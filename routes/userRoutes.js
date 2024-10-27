const express = require("express");
const UserController = require("../controllers/userController");
const router = express.Router();

router.post("/", UserController.createUser);
/*
{
  "name": "John Doe",
  "email": "john@mail.com",
  "password": "password",
  "profile": {
    "identity_type": "KTP",
    "identity_number": "1234567890",
    "address": "Surabaya"
  }
}
*/

router.get("/", UserController.getUsers);

router.get("/:userId", UserController.getUserById);

router.put("/:userId", UserController.updateUserById);
/*
{
    "email": "newemail@mail.com",
    "password": "newpassword"
}
*/

module.exports = router;
