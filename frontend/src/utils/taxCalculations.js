// Constants for tax calculation
const REBATE_LIMIT = 1200000;  // ₹12,00,000 (basic rebate limit)
const STANDARD_DEDUCTION = 75000;  // ₹75,000 (for salaried)
const MARGINAL_RELIEF_LIMIT = 1275000;  // ₹12,75,000

const SLAB_1_LIMIT = 400000;  // ₹4,00,000
const SLAB_2_LIMIT = 800000;  // ₹8,00,000
const SLAB_3_LIMIT = 1200000; // ₹12,00,000
const SLAB_4_LIMIT = 1600000; // ₹16,00,000
const SLAB_5_LIMIT = 2000000; // ₹20,00,000
const SLAB_6_LIMIT = 2400000; // ₹24,00,000

const TAX_RATES = {
    SLAB_1: 0,    // 0% up to 4L
    SLAB_2: 0.05, // 5% from 4L to 8L
    SLAB_3: 0.10, // 10% from 8L to 12L
    SLAB_4: 0.15, // 15% from 12L to 16L
    SLAB_5: 0.20, // 20% from 16L to 20L
    SLAB_6: 0.25, // 25% from 20L to 24L
    SLAB_7: 0.30  // 30% above 24L
};

const EMPLOYMENT_TYPES = {
    SALARIED: 'salaried',
    SELF_EMPLOYED: 'self-employed'
};

/**
 * Calculate regular tax based on slabs
 * @param {number} income - Taxable income
 * @returns {number} Tax amount
 */
const calculateRegularTax = (income) => {
    let tax = 0;
    
    if (income > SLAB_1_LIMIT) {
        tax += Math.min(income - SLAB_1_LIMIT, SLAB_2_LIMIT - SLAB_1_LIMIT) * TAX_RATES.SLAB_2;
    }
    if (income > SLAB_2_LIMIT) {
        tax += Math.min(income - SLAB_2_LIMIT, SLAB_3_LIMIT - SLAB_2_LIMIT) * TAX_RATES.SLAB_3;
    }
    if (income > SLAB_3_LIMIT) {
        tax += Math.min(income - SLAB_3_LIMIT, SLAB_4_LIMIT - SLAB_3_LIMIT) * TAX_RATES.SLAB_4;
    }
    if (income > SLAB_4_LIMIT) {
        tax += Math.min(income - SLAB_4_LIMIT, SLAB_5_LIMIT - SLAB_4_LIMIT) * TAX_RATES.SLAB_5;
    }
    if (income > SLAB_5_LIMIT) {
        tax += Math.min(income - SLAB_5_LIMIT, SLAB_6_LIMIT - SLAB_5_LIMIT) * TAX_RATES.SLAB_6;
    }
    if (income > SLAB_6_LIMIT) {
        tax += (income - SLAB_6_LIMIT) * TAX_RATES.SLAB_7;
    }
    
    return tax;
};

/**
 * Calculate tax for salaried individuals
 * @param {number} income - Total income
 * @returns {Object} Tax calculation details
 */
const calculateSalariedTax = (income) => {
    // Apply standard deduction
    const taxableIncome = Math.max(0, income - STANDARD_DEDUCTION);
    let basicTax = 0;
    let finalTax = 0;
    let isRebateApplicable = false;

    // Check if eligible for rebate after standard deduction
    if (taxableIncome <= REBATE_LIMIT) {
        isRebateApplicable = true;
    } else {
        // Regular tax calculation
        basicTax = calculateRegularTax(taxableIncome);
        finalTax = basicTax;
    }

    return {
        income,
        taxableIncome,
        basicTax,
        finalTax,
        isRebateApplicable,
        isMarginalReliefApplicable: false,
        employmentType: EMPLOYMENT_TYPES.SALARIED
    };
};

/**
 * Calculate tax for self-employed individuals
 * @param {number} income - Total income
 * @returns {Object} Tax calculation details
 */
const calculateSelfEmployedTax = (income) => {
    const taxableIncome = income;
    let basicTax = 0;
    let finalTax = 0;
    let marginalRelief = 0;
    let isRebateApplicable = false;
    let isMarginalReliefApplicable = false;

    if (income <= REBATE_LIMIT) {
        // No tax below 12L
        isRebateApplicable = true;
    } else if (income <= MARGINAL_RELIEF_LIMIT) {
        // Between 12L and 12.75L
        isMarginalReliefApplicable = true;
        basicTax = calculateRegularTax(income);
        finalTax = income - REBATE_LIMIT; // Tax is just the excess over 12L
        marginalRelief = basicTax - finalTax;
    } else {
        // Above 12.75L
        basicTax = calculateRegularTax(income);
        finalTax = basicTax;
    }

    return {
        income,
        taxableIncome,
        basicTax,
        marginalRelief,
        finalTax,
        isRebateApplicable,
        isMarginalReliefApplicable,
        employmentType: EMPLOYMENT_TYPES.SELF_EMPLOYED
    };
};

/**
 * Calculate final tax with all applicable reliefs and deductions
 * @param {number} income - Total income
 * @param {string} employmentType - Type of employment
 * @returns {Object} Tax calculation details
 */
export const calculateTaxWithMarginalRelief = (income, employmentType = EMPLOYMENT_TYPES.SALARIED) => {
    if (employmentType === EMPLOYMENT_TYPES.SALARIED) {
        return calculateSalariedTax(income);
    } else {
        return calculateSelfEmployedTax(income);
    }
};

/**
 * Calculate slab-wise breakup of income
 * @param {number} income - Taxable income
 * @returns {Object} Slab-wise breakup
 */
const calculateSlabBreakup = (income) => {
    return {
        slab1: income <= SLAB_1_LIMIT ? income : SLAB_1_LIMIT,
        slab2: income > SLAB_1_LIMIT ? Math.min(income - SLAB_1_LIMIT, SLAB_2_LIMIT - SLAB_1_LIMIT) : 0,
        slab3: income > SLAB_2_LIMIT ? Math.min(income - SLAB_2_LIMIT, SLAB_3_LIMIT - SLAB_2_LIMIT) : 0,
        slab4: income > SLAB_3_LIMIT ? Math.min(income - SLAB_3_LIMIT, SLAB_4_LIMIT - SLAB_3_LIMIT) : 0,
        slab5: income > SLAB_4_LIMIT ? Math.min(income - SLAB_4_LIMIT, SLAB_5_LIMIT - SLAB_4_LIMIT) : 0,
        slab6: income > SLAB_5_LIMIT ? Math.min(income - SLAB_5_LIMIT, SLAB_6_LIMIT - SLAB_5_LIMIT) : 0,
        slab7: income > SLAB_6_LIMIT ? income - SLAB_6_LIMIT : 0
    };
};

// Helper function to format currency in Indian format
export const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// Export employment types for use in components
export const EMPLOYMENT_TYPE = EMPLOYMENT_TYPES; 