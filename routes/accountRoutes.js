const express = require("express");
const AccountController = require("../controllers/accountController");
const router = express.Router();

router.post("/", AccountController.createAccount);
/*
{
  "userId": 1,
  "bank_name": "Bank A",
  "bank_account_number": "101101",
  "balance": 500000
}
  {
  "userId": 2,
  "bank_name": "Bank A",
  "bank_account_number": "102102",
  "balance": 1000000
}
*/

router.get("/", AccountController.getAccounts);

router.get("/:accountId", AccountController.getAccountById);

module.exports = router;