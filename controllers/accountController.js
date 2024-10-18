const prisma = require("../models/prismaClients");

exports.createAccount = async (req, res) => {
    const { userId, bank_name, bank_account_number, balance } = req.body;
    try {
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
        console.error(error);
        res.status(400).json({ error: "Error creating bank account" });
    }
};

exports.getAccounts = async (req, res) => {
    try {
        const accounts = await prisma.bankAccount.findMany();
        res.status(200).json(accounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching accounts" });
    }
}

exports.getAccountById = async (req, res) => {
    const { accountId } = req.params;
    try {
        const account = await prisma.bankAccount.findUnique({
            where: { id: parseInt(accountId) },
        });

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        res.status(200).json(account);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching account deatil" });
    }
}
