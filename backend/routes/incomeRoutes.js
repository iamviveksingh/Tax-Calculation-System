const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");

// Get user's income history
router.get("/:userId", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // Convert both IDs to strings for comparison
        const userIdStr = userId.toString();
        const reqUserStr = req.user.toString();

        if (userIdStr !== reqUserStr) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        // Query for both string and ObjectId formats
        const userIdObj = new mongoose.Types.ObjectId(userId);
        const incomes = await mongoose.model('Income').find({
            $or: [
                { userId: userIdObj },  // Match ObjectId format
                { userId: userId }      // Match string format
            ]
        })
        .sort({ createdAt: -1 })
        .lean();

        // Format numbers consistently
        const formattedIncomes = incomes.map(income => ({
            ...income,
            salary: Number(income.salary || 0),
            otherIncome: Number(income.otherIncome || 0),
            deductions: Number(income.deductions || 0),
            taxCalculated: Number(Number(income.taxCalculated).toFixed(2)),
            totalIncome: Number((Number(income.salary || 0) + Number(income.otherIncome || 0)).toFixed(2))
        }));

        console.log("Found incomes for user:", userId, "Count:", formattedIncomes.length);
        res.json(formattedIncomes);
    } catch (err) {
        console.error("Income Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch income history" });
    }
});

module.exports = router; 