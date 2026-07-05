import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import connectDB from './config/db.js';
import passport from './components/passport.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import AddressRoutes from './routes/address.js';
import imageURl from './routes/imageURl.js';
import {getSession} from "./components/session.js"
// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();

// ── Security Middleware ──
app.use(helmet());                                        // security headers
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",  // never "*" with credentials
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));                  // reduced from 10mb
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());                                 // prevents NoSQL injection

// ── Rate Limiting ──
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 200,                     // 200 requests per window
  message: { success: false, message: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", generalLimiter);

// Stricter rate limit on auth routes (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,                      // 20 login/register attempts per 15min
  message: { success: false, message: "Too many auth attempts, try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Express-session + Passport (BEFORE routes) ──
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ──
app.use("/api/images", imageURl);
app.use("/api/auth", authLimiter, authRoutes);            // stricter rate limit on auth
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", AddressRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/api/loginstatus",async(req,res)=>{
   const session = await getSession(req); // Reads and verifies the session token from cookies
      // console.log("session",session)
      if (!session) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired session' });
      }
      else{
        return res.status(200).json({success:true,message:"has user cookies"})
      }
})

// ── Serve React build in production ──
app.get("/api", (req, res) => {
  res.send("API is running...");
});

// ── Error handler (never leak internal errors) ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : err.message,
  });
});

// ── Graceful shutdown ──
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/health`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});
