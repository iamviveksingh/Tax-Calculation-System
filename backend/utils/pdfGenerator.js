const PDFDocument = require('pdfkit');

function generateTaxReport(data) {
    const doc = new PDFDocument({
        size: 'A4',
        margin: 40
    });

    // Helper function to convert text to Title Case
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
    }

    // Colors matching the application theme
    const primaryColor = '#0072ff';
    const secondaryColor = '#00c6ff';
    const textColor = '#1f2937';
    const lightGray = '#f8fafc';
    const borderColor = '#e2e8f0';

    // Draw modern header
    function drawModernHeader() {
        // Header background
        doc.rect(0, 0, 595.28, 80)
            .fill(primaryColor);
        
        // Add decorative accent line
        doc.rect(0, 80, 595.28, 3)
            .fill(secondaryColor);

        // Logo and title with enhanced styling
        doc.fontSize(32)
            .font('Helvetica-Bold')
            .fillColor('white')
            .text('TaxEase', 40, 15)
            .fontSize(14)
            .text('Tax Calculation Report', 40, 48);

        // User info with modern layout
        if (data.user && data.user.name) {
            doc.fontSize(12)
                .fillColor('white')
                .text(`Generated For: ${toTitleCase(data.user.name)}`, 300, 20)
                .fontSize(10)
                .text(`Date: ${new Date().toLocaleString('en-IN')}`, 300, 40);
        }
    }

    // Draw design elements
    drawModernHeader();

    let y = 100;

    // Enhanced section styling
    function drawSectionBackground(yPos, height) {
        // Draw main background
        doc.rect(40, yPos, 515.28, height)
            .fillColor(lightGray)
            .fill()
            .strokeColor(borderColor)
            .stroke();

        // Add accent line
        doc.rect(40, yPos, 515.28, 2)
            .fill(secondaryColor);
    }

    // User and Income Details Section with enhanced styling
    drawSectionBackground(y, 140);

    // Left column - User Details
    doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor(textColor)
        .text('User Information', 50, y + 10);

    const userDetails = [
        ['Email:', data.user.email],
        ['Member Since:', new Date(data.user.createdAt).toLocaleDateString('en-IN')],
        ['Account Type:', toTitleCase(data.user.accountType || 'Standard User')]
    ];

    userDetails.forEach(([label, value], index) => {
        doc.fontSize(10)
            .font('Helvetica-Bold')
            .fillColor(textColor)
            .text(toTitleCase(label), 50, y + 35 + (index * 20))
            .font('Helvetica')
            .text(value, 130, y + 35 + (index * 20));
    });

    // Right column - Income Details
    doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('Income Details', 300, y + 10);

    const incomeDetails = [
        ['Employment:', data.employmentType === 'salaried' ? 'Salaried' : 'Self-Employed'],
        ['Salary:', `₹${Number(data.salary).toLocaleString('en-IN')}`],
        ['Other Income:', `₹${Number(data.otherIncome).toLocaleString('en-IN')}`],
        ['Total Income:', `₹${Number(data.totalIncome).toLocaleString('en-IN')}`],
        data.employmentType === 'salaried' ? 
            ['Std. Deduction:', `₹${Number(data.standardDeduction).toLocaleString('en-IN')}`] : null,
        ['Taxable Income:', `₹${Number(data.taxableIncome).toLocaleString('en-IN')}`]
    ].filter(Boolean);

    incomeDetails.forEach(([label, value], index) => {
        doc.fontSize(10)
            .font('Helvetica-Bold')
            .fillColor(textColor)
            .text(toTitleCase(label), 300, y + 35 + (index * 20))
            .font('Helvetica')
            .text(value, 380, y + 35 + (index * 20));
    });

    y += 160;

    // Tax Breakdown Section
    doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('Tax Breakdown', 40, y);

    y += 25;

    // Draw tax slabs table with improved formatting
    const tableTop = y;
    const tableWidth = 515.28;
    const colWidths = [180, 80, 120];

    // Table headers with background
    doc.rect(40, y, tableWidth, 20)
        .fillColor(primaryColor)
        .fill();

    doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('white')
        .text('Income Slab', 50, y + 5)
        .text('Rate', 240, y + 5)
        .text('Tax Amount', 330, y + 5);

    y += 20;

    // Table rows
    data.breakdown.slabs.forEach(slab => {
        if (slab.amount > 0) {
            doc.rect(40, y, tableWidth, 20)
                .fillColor(lightGray)
                .fill()
                .strokeColor(borderColor)
                .stroke();

            doc.fontSize(10)
                .font('Helvetica')
                .fillColor(textColor)
                .text(toTitleCase(slab.range), 50, y + 5)
                .text(slab.rate, 240, y + 5)
                .font('Helvetica-Bold')
                .text(`₹${Number(slab.amount).toLocaleString('en-IN')}`, 330, y + 5);
            y += 20;
        }
    });

    // Total Tax Section
    y += 20;
    doc.rect(40, y, tableWidth, 50)
        .fillColor(primaryColor)
        .fill();

    doc.fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('white')
        .text('Total Tax Payable:', 50, y + 15)
        .fontSize(18)
        .text(`₹${Number(data.tax).toLocaleString('en-IN')}`, 330, y + 15);

    // Footer
    doc.fontSize(8)
        .font('Helvetica')
        .fillColor(textColor)
        .text('This Is A Computer-Generated Document And Does Not Require Signature. For Queries, Contact support@taxease.com', 40, 780, {
            align: 'center',
            width: 515.28
        });

    return doc;
}

module.exports = { generateTaxReport }; 