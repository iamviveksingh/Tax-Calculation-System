const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "5c60e013c160bd8bdb23e89738d39bec15c052a69944f64702a632a69f466b4f";

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Access Denied. No token provided." });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.userId; // Attach userId to request
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid Token" });
    }
};

module.exports = authMiddleware;
