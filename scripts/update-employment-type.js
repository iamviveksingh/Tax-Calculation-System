const mongoose = require('mongoose');

async function updateEmploymentType() {
    try {
        await mongoose.connect('mongodb://localhost:27017/tax-calculator');
        console.log('Connected to MongoDB');

        // Update all documents without employmentType to 'salaried' by default
        const result = await mongoose.connection.collection('incomes').updateMany(
            { employmentType: { $exists: false } },
            { $set: { employmentType: 'salaried' } }
        );

        console.log(`Updated ${result.modifiedCount} documents with default employment type`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateEmploymentType(); 