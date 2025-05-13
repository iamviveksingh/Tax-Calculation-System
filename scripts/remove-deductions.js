const mongoose = require('mongoose');

async function removeDeductions() {
    try {
        await mongoose.connect('mongodb://localhost:27017/tax-calculator');
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.collection('incomes').updateMany(
            {},
            { $unset: { deductions: "" } }
        );

        console.log(`Updated ${result.modifiedCount} documents`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

removeDeductions(); 