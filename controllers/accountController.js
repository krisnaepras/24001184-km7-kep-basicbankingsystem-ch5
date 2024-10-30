const prisma = require("../models/prismaClients");

class AccountController {
    static async createAccount(req, res) {
        const { userId, bank_name, bank_account_number, balance } = req.body;
        if (
            !userId ||
            !bank_name ||
            !bank_account_number ||
            balance === undefined
        ) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (isNaN(balance)) {
            return res.status(400).json({ error: "Invalid input for balance" });
        }
        try {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(userId) },
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const existingAccount = await prisma.bankAccount.findFirst({
                where: { bank_account_number },
            });
            if (existingAccount) {
                return res
                    .status(400)
                    .json({ error: "Bank account number already exists" });
            }

            const newAccount = await prisma.bankAccount.create({
                data: {
                    bank_name,
                    bank_account_number,
                    balance,
                    user: { connect: { id: parseInt(userId) } },
                },
            });
            res.status(201).json(newAccount);
        } catch (error) {
            // console.error(error);
            res.status(400).json({ error: "Error creating bank account" });
        }
    }

    static async getAccounts(req, res) {
        try {
            const accounts = await prisma.bankAccount.findMany();
            res.status(200).json(accounts);
        } catch (error) {
            // console.error(error);
            res.status(400).json({ error: "Error fetching accounts" });
        }
    }

    static async getAccountById(req, res) {
        const { accountId } = req.params;
        if (isNaN(parseInt(accountId))) {
            return res.status(400).json({ error: "Invalid account ID" });
        }
        try {
            const account = await prisma.bankAccount.findUnique({
                where: { id: parseInt(accountId) },
            });
            if (!account) {
                return res.status(404).json({ error: "Account not found" });
            }
            res.status(200).json(account);
        } catch (error) {
            // console.error(error);
            res.status(400).json({ error: "Error fetching account detail" });
        }
    }
}

module.exports = AccountController;
