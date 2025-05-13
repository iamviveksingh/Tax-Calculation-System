const express = require("express");
const router = express.Router();
const Income = require("../models/Income");
const User = require("../models/User");  // Add User model import
const mongoose = require("mongoose"); // Add mongoose import
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Ensure correct import
const { generateTaxReport } = require("../utils/pdfGenerator");

// Calculate tax and save income data
router.post("/calculate", authMiddleware, async (req, res) => {
    try {
        const { salary, otherIncome, employmentType } = req.body;
        console.log("Received request:", { salary, otherIncome, employmentType });
        
        // Convert all values to numbers and handle null/undefined
        const salaryNum = Number(salary) || 0;
        const otherIncomeNum = Number(otherIncome) || 0;
        
        const totalIncome = salaryNum + otherIncomeNum;
        console.log("Total income calculated:", totalIncome);

        if (!employmentType || !["salaried", "self-employed"].includes(employmentType)) {
            return res.status(400).json({ error: "Invalid employment type" });
        }

        const taxDetails = computeTax(totalIncome, employmentType);
        console.log("Tax calculation result:", taxDetails);

        // Ensure userId is always stored as ObjectId
        const userId = typeof req.user === 'string' ? new mongoose.Types.ObjectId(req.user) : req.user;

        const newIncome = new Income({
            userId: userId,
            salary: salaryNum,
            otherIncome: otherIncomeNum,
            employmentType: employmentType,
            taxCalculated: Number(taxDetails.calculatedTax.toFixed(2))
        });

        await newIncome.save();
        console.log("Income data saved with userId:", userId, "Tax calculated:", taxDetails.calculatedTax);

        res.json({ 
            totalIncome: Number(totalIncome.toFixed(2)),
            tax: Number(taxDetails.calculatedTax.toFixed(2)),
            breakdown: taxDetails.breakdown,
            incomeId: newIncome._id 
        });
    } catch (err) {
        console.error("Detailed error:", err);
        res.status(500).json({ 
            error: "Failed to calculate tax", 
            details: err.message 
        });
    }
});

// GET /api/tax/brackets - Get tax slabs
router.get("/brackets", (req, res) => {
    const taxSlabs = [
        { min: 0, max: 1200000, rate: 0, tax: "Nil" },
        { min: 1200001, max: 1600000, rate: 15, tax: "15% of income exceeding ₹12,00,000" },
        { min: 1600001, max: 2000000, rate: 20, tax: "₹60,000 + 20% of income exceeding ₹16,00,000" },
        { min: 2000001, max: 2400000, rate: 25, tax: "₹1,40,000 + 25% of income exceeding ₹20,00,000" },
        { min: 2400001, max: Infinity, rate: 30, tax: "₹2,40,000 + 30% of income exceeding ₹24,00,000" }
    ];
    res.json(taxSlabs);
});

// Helper function to calculate tax according to 2025 tax regime
function computeTax(income, employmentType) {
    let standardDeduction = (employmentType === "salaried") ? 75000 : 0;
    let taxableIncome = income - standardDeduction;
    let tax = 0;
    let breakdown = {
        totalIncome: income,
        employmentType,
        standardDeduction,
        taxableIncome,
        slabs: [
            { range: "0 - 4,00,000", rate: "0%", amount: 0 },
            { range: "4,00,001 - 8,00,000", rate: "5%", amount: taxableIncome > 400000 ? Math.min(400000, taxableIncome - 400000) * 0.05 : 0 },
            { range: "8,00,001 - 12,00,000", rate: "10%", amount: taxableIncome > 800000 ? Math.min(400000, taxableIncome - 800000) * 0.10 : 0 },
            { range: "12,00,001 - 16,00,000", rate: "15%", amount: taxableIncome > 1200000 ? Math.min(400000, taxableIncome - 1200000) * 0.15 : 0 },
            { range: "16,00,001 - 20,00,000", rate: "20%", amount: taxableIncome > 1600000 ? Math.min(400000, taxableIncome - 1600000) * 0.20 : 0 },
            { range: "20,00,001 - 24,00,000", rate: "25%", amount: taxableIncome > 2000000 ? Math.min(400000, taxableIncome - 2000000) * 0.25 : 0 },
            { range: "Above 24,00,000", rate: "30%", amount: taxableIncome > 2400000 ? (taxableIncome - 2400000) * 0.30 : 0 }
        ]
    };

    // For salaried employees
    if (employmentType === "salaried") {
        if (taxableIncome <= 1200000) {
            tax = 0; // No tax if taxable income is within ₹12L
        } else {
            // Calculate tax for each slab
            if (taxableIncome > 400000) {
                tax += Math.min(taxableIncome - 400000, 400000) * 0.05;
            }
            if (taxableIncome > 800000) {
                tax += Math.min(taxableIncome - 800000, 400000) * 0.10;
            }
            if (taxableIncome > 1200000) {
                tax += Math.min(taxableIncome - 1200000, 400000) * 0.15;
            }
            if (taxableIncome > 1600000) {
                tax += Math.min(taxableIncome - 1600000, 400000) * 0.20;
            }
            if (taxableIncome > 2000000) {
                tax += Math.min(taxableIncome - 2000000, 400000) * 0.25;
            }
            if (taxableIncome > 2400000) {
                tax += (taxableIncome - 2400000) * 0.30;
            }
        }
    }
    // For self-employed
    else {
        if (income <= 1200000) {
            tax = 0; // No tax below 12L
        } else if (income < 1275000) {
            tax = income - 1200000; // Tax is just the excess over 12L
        } else {
            // Calculate tax for each slab
            if (income > 400000) {
                tax += Math.min(income - 400000, 400000) * 0.05;
            }
            if (income > 800000) {
                tax += Math.min(income - 800000, 400000) * 0.10;
            }
            if (income > 1200000) {
                tax += Math.min(income - 1200000, 400000) * 0.15;
            }
            if (income > 1600000) {
                tax += Math.min(income - 1600000, 400000) * 0.20;
            }
            if (income > 2000000) {
                tax += Math.min(income - 2000000, 400000) * 0.25;
            }
            if (income > 2400000) {
                tax += (income - 2400000) * 0.30;
            }
        }
    }

    return { 
        standardDeduction, 
        taxableIncome, 
        calculatedTax: tax,
        breakdown 
    };
}

// Generate PDF report for a specific calculation
router.get("/report/:calculationId", authMiddleware, async (req, res) => {
    try {
        const { calculationId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(calculationId)) {
            return res.status(400).json({ error: "Invalid calculation ID" });
        }

        const calculation = await Income.findById(calculationId)
            .populate('userId', 'name email createdAt accountType'); // Populate user details
        
        if (!calculation) {
            return res.status(404).json({ error: "Calculation not found" });
        }

        // Verify user owns this calculation
        if (calculation.userId._id.toString() !== req.user.toString()) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        // Calculate tax details
        const totalIncome = calculation.salary + calculation.otherIncome;
        const taxDetails = computeTax(totalIncome, calculation.employmentType);

        // Prepare data for PDF with user information from populated field
        const reportData = {
            user: {
                name: calculation.userId.name,
                email: calculation.userId.email,
                createdAt: calculation.userId.createdAt,
                accountType: calculation.userId.accountType || 'Standard User'
            },
            employmentType: calculation.employmentType,
            salary: calculation.salary,
            otherIncome: calculation.otherIncome,
            totalIncome,
            standardDeduction: taxDetails.standardDeduction,
            taxableIncome: taxDetails.taxableIncome,
            tax: calculation.taxCalculated,
            breakdown: taxDetails.breakdown,
            calculationDate: calculation.createdAt
        };

        console.log("PDF Report Data:", reportData); // Add logging to verify data

        // Generate PDF
        const doc = generateTaxReport(reportData);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=tax-report-${calculationId}.pdf`);

        // Stream the PDF to response
        doc.pipe(res);
        doc.end();

    } catch (err) {
        console.error("PDF Generation Error:", err);
        res.status(500).json({ 
            error: "Failed to generate PDF report", 
            details: err.message 
        });
    }
});

module.exports = router;
