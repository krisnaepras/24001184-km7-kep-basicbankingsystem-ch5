const prisma = require('../models/prismaClients')

class TransactionController {
    static async createTransaction(req, res) {
        const { sourceAccountNumber, destinationAccountNumber, amount } = req.body;
    
        if (!sourceAccountNumber || !destinationAccountNumber || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }
    
        if (isNaN(amount)) {
            return res.status(400).json({ error: "Invalid input for amount" });
        }
    
        try {
            const sourceAccount = await prisma.bankAccount.findUnique({
                where: { bank_account_number: sourceAccountNumber },
            });
    
            if (!sourceAccount || sourceAccount.balance < amount) {
                return res.status(400).json({ error: "Insufficient funds or source account not found" });
            }
    
            const destinationAccount = await prisma.bankAccount.findUnique({
                where: { bank_account_number: destinationAccountNumber },
            });
    
            if (!destinationAccount) {
                return res.status(400).json({ error: "Destination account not found" });
            }
    
            const transaction = await prisma.transaction.create({
                data: {
                    amount,
                    sourceAccount: {
                        connect: { id: sourceAccount.id },
                    },
                    destinationAccount: {
                        connect: { id: destinationAccount.id },
                    },
                },
            });
    
            await prisma.bankAccount.update({
                where: { id: sourceAccount.id },
                data: { balance: sourceAccount.balance - amount },
            });
    
            await prisma.bankAccount.update({
                where: { id: destinationAccount.id },
                data: { balance: destinationAccount.balance + amount },
            });
    
            res.status(201).json(transaction);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Error creating transaction" });
        }
    }
    
    static async getTransactions(req, res) {
        try {
            const transactions = await prisma.transaction.findMany({
                include: {
                    sourceAccount: true,
                    destinationAccount: true,
                },
            });
            res.status(200).json(transactions);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Error fetching transaction" });
        }
    }
    
    static async getTransactionById(req, res) {
        const { transactionId } = req.params;
        try {
            const transaction = await prisma.transaction.findUnique({
                where: { id: parseInt(transactionId) },
                include: {
                    sourceAccount: true,
                    destinationAccount: true,
                },
            });
            if (!transaction) {
                return res.status(404).json({ error: "Transaction not found" });
            }
            res.status(200).json(transaction);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Error fetching transaction details" });
        }
    }
    
    static async destroyTransactionById(req, res) {
        const { transactionId } = req.params;
    
        try {
            const deletedTransaction = await prisma.transaction.delete({
                where: { id: parseInt(transactionId) },
            });
    
            res.status(200).json({
                message: "Transaction deleted successfully",
                deletedTransaction,
            });
        } catch (error) {
            console.error(error);
            res.status(400).json({
                error: "Error deleting transaction or transaction not found",
            });
        }
    }
}

module.exports = TransactionController;