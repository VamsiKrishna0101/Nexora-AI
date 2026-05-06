import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import companyRouter from './src/modules/companyData/companyrouter';
import employeeRouter from './src/modules/companyEmployees/employee.router';
import timelineRouter from './src/modules/businesstimeline/timeline.routers';
import newsRouter from './src/modules/newsfeed/newsfeed.routers';
import techstackrouter from './src/modules/techstack/techstack.router';
import financerouter from './src/modules/financials/finance.routers';
import companyjobsrouter from './src/modules/companyjobs/companyjsobs.router';
import productrouter from './src/modules/products/product.router'
import linkedinpostsrouter from './src/modules/linkedinposts/linkedinposts.router'
import competitorrouter from './src/modules/competitors/competitor.routers'
import gatherRouter from './src/modules/gather/gather.router'
import authRouter from './src/modules/auth/auth.router'
import reportsRouter from './src/modules/reports/reports.router'
import compareRouter from './src/modules/compare/compare.router'
import savedRouter from './src/modules/saved/saved.routes'
import { verifyToken, verifyInternalSecret } from './src/middleware/auth.middleware'
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Image Proxy to bypass CORS and Referrer blocks (LinkedIn, Twitter, etc.)
app.get('/api/proxy-image', async (req: Request, res: Response) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
        res.status(400).json({ success: false, error: 'URL is required' });
        return;
    }

    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://www.linkedin.com/',
                'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'image',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'cross-site'
            }
        });

        const contentType = response.headers['content-type'] || 'image/jpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(Buffer.from(response.data));
    } catch (error: any) {
        console.error(`[Proxy Image Error] ${url} -> ${error.message}`);
        
        // Return a professional grey placeholder image instead of failing
        const placeholderSvg = `
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#1E2D4A"/>
                <circle cx="100" cy="80" r="40" fill="#9CA3AF"/>
                <path d="M60 160 Q100 120 140 160" stroke="#9CA3AF" stroke-width="8" fill="none" stroke-linecap="round"/>
            </svg>
        `.trim();
        
        console.log(`Returning placeholder for: ${url}`);
        res.status(200); // Ensure 200 even on error
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(Buffer.from(placeholderSvg));
    }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/compare', compareRouter);
app.use("/api/gather", gatherRouter);
app.use("/api/saved", savedRouter);

// Protected API Routes
app.use('/api/companies', verifyToken, companyRouter);
app.use('/api/employees', verifyToken, employeeRouter);
app.use("/api/timeline", verifyToken, timelineRouter);
app.use("/api/news", verifyToken, newsRouter);
app.use("/api/techstack", verifyToken, techstackrouter);
app.use("/api/finance", verifyToken, financerouter);
app.use("/api/companyjobs", verifyToken, companyjobsrouter);
app.use("/api/products", verifyToken, productrouter);
app.use("/api/linkedinposts", verifyToken, linkedinpostsrouter);
app.use("/api/competitors", verifyToken, competitorrouter)

// Handle 404 Route Not Found
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[404] ${req.method} ${req.url}`);
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[Error] ${err.message}`);

    // In production, avoid sending actual stack traces to the client
    const isProd = process.env.NODE_ENV === 'production';

    res.status(500).json({
        success: false,
        error: isProd ? 'Internal server error' : err.message,
        stack: isProd ? undefined : err.stack
    });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
