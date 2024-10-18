const express = require("express");
const transactionController = require("../controllers/transactionController");
const router = express.Router();

router.post("/", transactionController.createTransaction);
/*
{
  "sourceAccountNumber": "102102",
  "destinationAccountNumber": "101101",
  "amount": 50000
}
*/

router.get("/", transactionController.getTransactions);

router.get("/:transactionId", transactionController.getTransactionById);

router.delete("/:transactionId", transactionController.destroyTransactionById);


module.exports = router;