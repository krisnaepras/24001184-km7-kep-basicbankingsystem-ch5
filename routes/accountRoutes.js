const express = require("express");
const accountController = require("../controllers/accountController");
const router = express.Router();

router.post("/", accountController.createAccount);
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

router.get("/", accountController.getAccounts);

router.get("/:accountId", accountController.getAccountById);

module.exports = router;