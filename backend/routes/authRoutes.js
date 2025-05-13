const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "5c60e013c160bd8bdb23e89738d39bec15c052a69944f64702a632a69f466b4f";

// 📌 ✅ Add Token Verification Route
router.post("/verify", authMiddleware, (req, res) => {
    res.json({ message: "Token is valid", userId: req.user });
});

// 📌 User Registration (Signup)
router.post("/register", [
    body("name").trim().notEmpty().withMessage("Name is required").escape(),
    body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email }).lean();
        if (user) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📌 User Login
router.post("/login", [
    body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).lean();
        if (!user) return res.status(400).json({ error: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid Credentials" });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📌 Get User Data (Protected Route)
router.get("/user/:id", authMiddleware, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        const user = await User.findById(req.params.id).select("-password").lean();
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (err) {
        console.error("User Fetch Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
