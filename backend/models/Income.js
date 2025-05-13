const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    otherIncome: {
        type: Number,
        default: 0
    },
    employmentType: {
        type: String,
        enum: ['salaried', 'self-employed'],
        required: true
    },
    taxCalculated: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Income', incomeSchema);
