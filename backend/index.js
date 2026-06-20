import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import AddressRoutes from './routes/address.js';
import imageURl from './routes/imageURl.js';
import passport from "./components/passport.js"
import session from "express-session";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();


// ── Middleware ──
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/images", imageURl);
// ── API Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address",AddressRoutes );

// express-session creates the cookie and sends it to browser.
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize()); //This starts Passport and adds Passport functionality to every request.
app.use(passport.session());

// Health check
app.get("/api/health", (req, res) => { 
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Serve React build in production ──
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
});
