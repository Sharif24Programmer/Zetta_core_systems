/**
 * Firestore Database Schema Documentation
 * 
 * This file serves as a reference for the data structure used in the application.
 */

// 1. Users Collection (/users/{userId})
const UserSchema = {
    uid: "string",
    email: "string",
    name: "string",
    role: "owner" | "admin" | "staff",
    tenantId: "string",

    // Subscription & Approval Fields (New for Week 2)
    subscriptionStatus: "pending" | "active" | "expired" | "cancelled",
    planId: "string", // e.g. 'basic', 'pro', 'enterprise'
    billingCycle: "monthly" | "yearly",
    subscriptionStartDate: "Timestamp",
    subscriptionEndDate: "Timestamp",

    createdAt: "Timestamp",
    updatedAt: "Timestamp"
};

// 2. Plans Collection (/plans/{planId})
// Populated via SeedData.jsx
const PlanSchema = {
    id: "string", // 'basic', 'pro', 'enterprise'
    name: "string",
    price: "number",
    billingCycle: "string", // 'monthly'
    recommendedFor: "string",

    // Feature Flags
    features: {
        pos: true,
        inventory: true,
        billing: true,
        reports: "boolean",
        analytics: "boolean",
        staff: "boolean",
        invoices: "boolean",
        lab_module: "boolean",
        pharma_db: "boolean",
        patients: "boolean",
        api_access: "boolean"
    },

    // Usage Limits
    limits: {
        staff: "number",
        products: "number",
        bills: "number"
    },

    updatedAt: "Timestamp"
};

// 3. Tenants Collection (/tenants/{tenantId})
const TenantSchema = {
    id: "string",
    name: "string", // Shop Name
    type: "string", // 'medical', 'shop', 'clinic'
    ownerId: "string",
    address: "string",
    phone: "string",
    email: "string",
    createdAt: "Timestamp"
};

export const SchemaDocs = {
    UserSchema,
    PlanSchema,
    TenantSchema
};
