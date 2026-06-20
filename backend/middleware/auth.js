import User from "../models/User.js";
import { getSession } from "../components/session.js";

// Protect routes — require valid token
// const protect = async (req, res, next) => {
//   let token;
//   if (req.headers.authorization?.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//   }
//   if (!token) {
//     return res.status(401).json({ success: false, message: "Not authorized — no token" });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id);
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: "User not found" });
//     }
//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: "Token invalid or expired" });
//   }
// };
const googleprotect = async (req, res, next) => {
  try {
    const session = await getSession(req); // Reads and verifies the session token from cookies
    // console.log("session",session)

    if (!session) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired session' });
    }
    else {
      const user = await User.findById(session.userId)
      if (!user) {
        return res.status(401).json({ success: false, message: user });
      }

      // Attach user info to request

     req.user = {
        _id: session.userId,
         name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
        avatar: user.avatar,

      };
    }


    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};
const protect = async (req, res, next) => {
  try {
    const session = await getSession(req); // Reads and verifies the session token from cookies
    // console.log("session",session)

    if (!session) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired session' });
    }
    else {
      const user = await User.findById(session.userId)
        .select("role")
        .lean();
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Attach user info to request

      req.user = {
        _id: session.userId,
        role: user.role,

      };
    }


    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};

// Restrict to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }
    next();
  };
};

export { protect, authorize ,googleprotect};
