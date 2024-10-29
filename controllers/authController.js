const prisma = require("../models/prismaClients");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password } = req.body;

            const existUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existUser) {
                return res.status(400).json({ error: "Email already exists" });
            }
            const encryptedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: encryptedPassword,
                },
            });
            return res.status(201).json({
                message: "User created successfully",
                data: user,
            });
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Error creating user" });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await prisma.user.findUnique({
                where: { email },
            });
      
            const isPasswordMatch = await bcrypt.compare(
                password,
                user.password
            );
            if (!user || !isPasswordMatch) {
                return res.status(400).json({
                    message: "Bad Request",
                    error: "User or Password not found",
                });
            }

            const token = jwt.sign(user, process.env.JWT_SECRET_KEY);
            return res.status(200).json({ token });
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Error logging in" });
        }
    }

    static async authenticated(req, res) {
        return res.status(200).json({
            message: "Berhasil masuk",
        });
    }
}

module.exports = AuthController;
