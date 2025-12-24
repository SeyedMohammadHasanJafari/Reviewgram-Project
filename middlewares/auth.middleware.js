// middlewares/auth.middleware.js

import Jsonwebtoken from "jsonwebtoken";
import JWT_SECRET from "../app.js";
import User from "../models/user.model.js";

function verifyToken(req, res, next) {
  // const token = req.header('Authorization');
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = Jsonwebtoken.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export async function verifyAdminToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = Jsonwebtoken.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    req.userId = userId;
    const user = await User.findById(userId);
    if (user.role != "admin")
      return res.status(401).json({ error: "Access denied" });
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export default verifyToken;
