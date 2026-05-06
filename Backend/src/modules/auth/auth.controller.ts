import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { email, password, name } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, error: "Email and password are required" });
            }

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, error: "Email already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                },
            });

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || "fallback_secret",
                { expiresIn: "7d" }
            );

            return res.status(201).json({
                success: true,
                user: { id: user.id, email: user.email, name: user.name },
                token,
            });
        } catch (err: any) {
            console.error("[AuthController] Register error:", err.message);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, error: "Email and password are required" });
            }

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ success: false, error: "Invalid credentials" });
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ success: false, error: "Invalid credentials" });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || "fallback_secret",
                { expiresIn: "7d" }
            );

            return res.status(200).json({
                success: true,
                user: { id: user.id, email: user.email, name: user.name },
                token,
            });
        } catch (err: any) {
            console.error("[AuthController] Login error:", err.message);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    }

    async me(req: Request, res: Response) {
        try {
            // @ts-ignore
            const user = req.user;
            if (!user) return res.status(401).json({ success: false, error: "Not authenticated" });

            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { id: true, email: true, name: true, created_at: true },
            });

            return res.status(200).json({ success: true, user: dbUser });
        } catch (err: any) {
            console.error("[AuthController] Me error:", err.message);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    }
}

export default new AuthController();
