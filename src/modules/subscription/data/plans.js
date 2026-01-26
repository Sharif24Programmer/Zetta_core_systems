export const SUBSCRIPTION_PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 0,
        interval: 'month',
        description: 'Perfect for small shops getting started',
        features: [
            '1 User',
            'Up to 100 Products',
            'Basic POS',
            'Daily Sales Report',
            'Community Support'
        ],
        limits: {
            users: 1,
            products: 100,
            invoices: 500
        },
        color: 'slate',
        popular: false
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 999,
        interval: 'month',
        description: 'For growing businesses needing more control',
        features: [
            '5 Users',
            'Unlimited Products',
            'Advanced POS & Inventory',
            'Support Ticket System',
            'Analytics Dashboard',
            'Email Support'
        ],
        limits: {
            users: 5,
            products: -1, // Unlimited
            invoices: -1
        },
        color: 'primary',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 2499,
        interval: 'month',
        description: 'Full suite for large clinics and chains',
        features: [
            'Unlimited Users',
            'All Professional Features',
            'Multi-location Support',
            'Priority Phone Support',
            'Custom Reports',
            'API Access'
        ],
        limits: {
            users: -1,
            products: -1,
            invoices: -1
        },
        color: 'indigo',
        popular: false
    }
];
