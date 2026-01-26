import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';

/**
 * Analytics Service
 * Tracks user behavior and business events for insights
 */

// Event Categories
export const EVENTS = {
    // Auth Events
    AUTH: {
        LOGIN: 'login',
        SIGNUP: 'signup',
        LOGOUT: 'logout',
        SETUP_COMPLETE: 'business_setup_complete'
    },
    // POS Events
    POS: {
        NEW_BILL_START: 'new_bill_start',
        ADD_ITEM: 'add_item_to_cart',
        REMOVE_ITEM: 'remove_item_from_cart',
        CHECKOUT_START: 'checkout_start',
        PAYMENT_SUCCESS: 'payment_success',
        BILL_COMPLETE: 'bill_complete',
        BILL_PRINT: 'bill_print',
        BILL_SHARE: 'bill_share'
    },
    // Inventory Events
    INVENTORY: {
        PRODUCT_ADD: 'product_add',
        PRODUCT_EDIT: 'product_edit',
        STOCK_IN: 'stock_in',
        STOCK_OUT: 'stock_out',
        LOW_STOCK_VIEW: 'low_stock_view'
    },
    // Reports Events
    REPORTS: {
        VIEW_SALES: 'view_sales_report',
        VIEW_INVENTORY: 'view_inventory_report',
        EXPORT_REPORT: 'export_report'
    },
    // Subscription Events
    SUBSCRIPTION: {
        UPGRADE_MODAL_VIEW: 'upgrade_modal_view',
        UPGRADE_CLICK: 'upgrade_click',
        UPGRADE_SUCCESS: 'upgrade_success',
        LIMIT_REACHED: 'limit_reached'
    },
    // Clinic Events
    CLINIC: {
        PATIENT_ADD: 'patient_add',
        VISIT_START: 'visit_start',
        PRESCRIPTION_CREATE: 'prescription_create'
    },
    // Medical Events
    MEDICAL: {
        BATCH_ADD: 'batch_add',
        EXPIRY_WARNING: 'expiry_warning_view'
    }
};

/**
 * Track an event
 */
export const trackEvent = (eventName, params = {}) => {
    try {
        logEvent(analytics, eventName, {
            ...params,
            timestamp: new Date().toISOString()
        });
        console.log(`📊 Analytics: ${eventName}`, params);
    } catch (err) {
        console.warn('Analytics error:', err);
    }
};

/**
 * Track page view
 */
export const trackPageView = (pageName, params = {}) => {
    trackEvent('page_view', {
        page_name: pageName,
        ...params
    });
};

/**
 * Track user properties
 */
export const setUserProperties = (properties) => {
    try {
        // Firebase analytics user properties
        Object.entries(properties).forEach(([key, value]) => {
            logEvent(analytics, 'set_user_property', { [key]: value });
        });
    } catch (err) {
        console.warn('Analytics user properties error:', err);
    }
};

/**
 * Track business metrics
 */
export const trackBusiness = {
    billCreated: (billData) => {
        trackEvent(EVENTS.POS.BILL_COMPLETE, {
            bill_id: billData.id,
            total: billData.total,
            items_count: billData.items?.length || 0,
            payment_mode: billData.paymentMode
        });
    },

    productAdded: (product) => {
        trackEvent(EVENTS.INVENTORY.PRODUCT_ADD, {
            product_id: product.id,
            category: product.category,
            price: product.price
        });
    },

    stockChanged: (type, product, quantity) => {
        trackEvent(type === 'in' ? EVENTS.INVENTORY.STOCK_IN : EVENTS.INVENTORY.STOCK_OUT, {
            product_id: product.id,
            product_name: product.name,
            quantity
        });
    },

    upgradeViewed: (feature, currentPlan) => {
        trackEvent(EVENTS.SUBSCRIPTION.UPGRADE_MODAL_VIEW, {
            feature,
            current_plan: currentPlan
        });
    },

    limitReached: (limitType, current, max) => {
        trackEvent(EVENTS.SUBSCRIPTION.LIMIT_REACHED, {
            limit_type: limitType,
            current,
            max
        });
    }
};
