const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/", userController.createUser);
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

router.get("/", userController.getUsers);

router.get("/:userId", userController.getUserById);

router.put("/:userId", userController.updateUserById);
/*
{
    "email": "newemail@mail.com",
    "password": "newpassword"
}
*/

module.exports = router;
