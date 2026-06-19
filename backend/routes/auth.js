import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import {createSession} from "../components/session.js";
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = express.Router();

// const generateToken = (id) =>
//   jwt.sign({ id }, 
//     process.env.JWT_SECRET, 
//     { expiresIn: process.env.JWT_EXPIRE || "7d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, storeName, storeDescription } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const userData = { name, email, password, role: role || "buyer" };
    if (role === "seller") {
      userData.storeName = storeName || name + "'s Store";
      userData.storeDescription = storeDescription || "";
    }

    const user = await User.create(userData);

    await createSession(res, user._id.toString());

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

   await createSession(res, user._id.toString());

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auth - Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
       session:false,    // <-- stops the session-based state check
}));

// Google OAuth callback route

router.get("/google/callback",
  passport.authenticate("google", {session:false, failureRedirect: "/auth'" }),
  async(req, res) => {
    await createSession(res, user._id.toString());
    res.redirect('http://localhost:3000/shop');
  }
)

//get /api/auth/logout
router.get('/logout', protect, async (req, res) => {
  res.clearCookie('token', { path: '/' });
  return res.json({ success: true, message: 'session is deleted' });
});
// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


export default router;
