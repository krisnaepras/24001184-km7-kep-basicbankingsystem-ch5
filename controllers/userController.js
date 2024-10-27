const prisma = require("../models/prismaClients");


class UserController {
    static async createUser(req, res) {
        const { name, email, password, profile } = req.body;
        try {
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password,
                    profile: {
                        create: profile,
                    },
                },
            });
            res.status(201).json(newUser);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Error creating user" });
        }
    }

    static async getUsers(req, res) {
        try {
            const users = await prisma.user.findMany({
                include: { profile: true },
            });
            res.status(200).json(users);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Error fetching users" });
        }
    }

    static async getUserById(req, res) {
        const { userId } = req.params;
        try {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(userId) },
                include: { profile: true },
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Error fetching user details" });
        }
    }

    static async updateUserById(req, res) {
        const { userId } = req.params;
        const { email, password } = req.body;

        try {
            const updateUser = await prisma.user.update({
                where: { id: parseInt(userId) },
                data: {
                    email,
                    password,
                },
            });
            res.status(200).json({
                message: "User updated successfully",
                updateUser,
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                error: "Error updating user or user not found",
            });
        }
    }
}

module.exports = UserController;