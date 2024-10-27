const express = require("express");
const TransactionController = require("../controllers/transactionController");
const router = express.Router();

router.post("/", TransactionController.createTransaction);
/*
{
  "sourceAccountNumber": "102102",
  "destinationAccountNumber": "101101",
  "amount": 50000
}
*/

router.get("/", TransactionController.getTransactions);

router.get("/:transactionId", TransactionController.getTransactionById);

router.delete("/:transactionId", TransactionController.destroyTransactionById);


module.exports = router;