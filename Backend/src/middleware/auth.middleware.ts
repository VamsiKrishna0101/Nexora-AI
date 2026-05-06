import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, error: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

        // @ts-ignore
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: "Invalid or expired token." });
    }
};

export const verifyInternalSecret = (req: Request, res: Response, next: NextFunction) => {
    try {
        const secret = req.headers["x-internal-secret"];
        if (secret && secret === (process.env.INTERNAL_SECRET || "internal_fallback_secret")) {
            return next();
        }
        
        // Fallback to normal JWT verification if internal secret is missing or invalid
        // This allows the endpoint to be called both internally and by authenticated users
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
             return res.status(401).json({ success: false, error: "Access denied." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

        // @ts-ignore
        req.user = decoded;
        next();

    } catch (err) {
        return res.status(401).json({ success: false, error: "Access denied." });
    }
}
