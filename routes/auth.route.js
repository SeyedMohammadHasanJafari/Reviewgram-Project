// routes/auth.route.js
import { Router } from "express";
const router = Router();
import User from "../models/user.model.js";
import { hash, compare } from "bcrypt";
import Jsonwebtoken from "jsonwebtoken";
import JWT_SECRET from "../app.js";

// User registration
router.post("/signup", async(req, res) => {
    try {
        const { email, password, role, nickname } = req.body;
        if (!password) {
            throw { message: "password is empty!" };
        } else if (password.length < 8 || password.length > 100) {
            throw { message: "password is too short or long!" };
        }
        const hashedPassword = await hash(password, 10);
        const user = new User({ email, password: hashedPassword, role, nickname });
        await user.save();
        // res.status(201).json({ message: 'User registered successfully' });
        res.redirect("/pages/login");
    } catch (error) {
        res.status(500).json({ error: "Registration failed, " + error.message });
    }
});

// User login
router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Authentication failed" });
        }
        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Authentication failed" });
        }
        const token = Jsonwebtoken.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: "3h",
        });
        res.cookie("token", token, { maxAge: 10800000, httpOnly: true });
        // res.status(200).json({ message: 'cookie set!' });
        res.redirect("/pages");
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

export default router;