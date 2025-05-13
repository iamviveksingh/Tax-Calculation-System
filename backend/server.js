require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON request handling

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Failed:", err));

// 👉 Import Routes
const taxRoutes = require("./routes/taxRoutes");
const authRoutes = require("./routes/authRoutes"); // ✅ Import Auth Routes
const incomeRoutes = require("./routes/incomeRoutes"); // ✅ Import Income Routes

// 👉 Use Routes
app.use("/api/tax", taxRoutes);
app.use("/api/auth", authRoutes); // ✅ Add Authentication Routes
app.use("/api/incomes", incomeRoutes); // ✅ Add Income Routes

// Test Route
app.get("/", (req, res) => {
    res.send("Tax Calculation API is Running...");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
