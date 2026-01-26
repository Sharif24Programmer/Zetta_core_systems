/**
 * Lab Template Service
 * Manage lab test templates and provide helper functions
 */

import LAB_TEST_TEMPLATES, { LAB_CATEGORIES, SAMPLE_TYPES } from '../data/labTestTemplates';

/**
 * Get all lab test templates
 */
export const getAllTemplates = () => {
    return LAB_TEST_TEMPLATES;
};

/**
 * Get template by ID
 */
export const getTemplateById = (templateId) => {
    return LAB_TEST_TEMPLATES.find(t => t.id === templateId);
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category) => {
    return LAB_TEST_TEMPLATES.filter(t => t.category === category);
};

/**
 * Search templates by name or code
 */
export const searchTemplates = (query) => {
    const lowerQuery = query.toLowerCase();
    return LAB_TEST_TEMPLATES.filter(t =>
        t.testName.toLowerCase().includes(lowerQuery) ||
        t.testCode.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Get all unique categories
 */
export const getAllCategories = () => {
    return Object.values(LAB_CATEGORIES);
};

/**
 * Validate parameter value against normal range
 */
export const validateParameterValue = (parameter, value, patientGender, patientAge) => {
    if (!value || !parameter.normalRange) {
        return { status: 'unknown', message: '' };
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return { status: 'invalid', message: 'Invalid value' };
    }

    // Determine which range to use based on gender and age
    let range;
    if (parameter.normalRange.male && patientGender === 'male') {
        range = parameter.normalRange.male;
    } else if (parameter.normalRange.female && patientGender === 'female') {
        range = parameter.normalRange.female;
    } else if (parameter.normalRange.child && patientAge < 18) {
        range = parameter.normalRange.child;
    } else if (parameter.normalRange.general) {
        range = parameter.normalRange.general;
    } else {
        return { status: 'unknown', message: 'No applicable range' };
    }

    // Check critical values first
    if (parameter.criticalLow && numValue < parameter.criticalLow) {
        return { status: 'critical_low', message: '🚨 CRITICALLY LOW', color: 'red' };
    }
    if (parameter.criticalHigh && numValue > parameter.criticalHigh) {
        return { status: 'critical_high', message: '🚨 CRITICALLY HIGH', color: 'red' };
    }

    // Check normal range
    if (numValue < range.min) {
        return { status: 'low', message: '⬇️ LOW', color: 'orange' };
    }
    if (numValue > range.max) {
        return { status: 'high', message: '⬆️ HIGH', color: 'orange' };
    }

    return { status: 'normal', message: '✓ Normal', color: 'green' };
};

/**
 * Get normal range display text
 */
export const getNormalRangeText = (parameter, patientGender, patientAge) => {
    if (!parameter.normalRange) return '';

    let range;
    let label = '';

    if (parameter.normalRange.male && patientGender === 'male') {
        range = parameter.normalRange.male;
        label = ' (Male)';
    } else if (parameter.normalRange.female && patientGender === 'female') {
        range = parameter.normalRange.female;
        label = ' (Female)';
    } else if (parameter.normalRange.child && patientAge < 18) {
        range = parameter.normalRange.child;
        label = ' (Child)';
    } else if (parameter.normalRange.general) {
        range = parameter.normalRange.general;
        label = '';
    } else {
        return '';
    }

    return `${range.min} - ${range.max}${label}`;
};

/**
 * Calculate total price for selected tests
 */
export const calculateTotalPrice = (testIds, isUrgent = false) => {
    let total = 0;
    testIds.forEach(id => {
        const template = getTemplateById(id);
        if (template) {
            total += isUrgent ? template.urgentPrice : template.basePrice;
        }
    });
    return total;
};

/**
 * Export constants
 */
export { LAB_CATEGORIES, SAMPLE_TYPES };
