import { isDemoMode } from '../core/demo/demoManager';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Load Razorpay SDK
 */
const loadRazorpay = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = RAZORPAY_SCRIPT;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Create a payment order
 * In production, this should call your backend to create an order via Razorpay API
 */
export const createOrder = async (amount, currency = 'INR') => {
    if (isDemoMode()) {
        console.info('[Razorpay Mock] Creating order:', { amount, currency });
        return {
            id: `order_demo_${Date.now()}`,
            amount: amount * 100, // Razorpay expects amount in paise
            currency: currency
        };
    }

    // TODO: Call your backend to create order
    // const response = await fetch('/api/create-order', { ... });
    // return response.json();

    // For now, returning a mock order even in "production" until backend is ready
    // This allows UI testing without a backend
    console.warn('Backend not connected, returning mock order');
    return {
        id: `order_mock_${Date.now()}`,
        amount: amount * 100,
        currency: currency
    };
};

/**
 * Process Payment
 * @param {Object} options - Payment options
 * @param {Function} onSuccess - Callback on success
 * @param {Function} onFailure - Callback on failure
 */
export const processPayment = async ({
    amount,
    currency = 'INR',
    name = 'Zetta POS',
    description = 'Subscription Upgrade',
    prefill = {},
    theme = { color: '#6366f1' }
}, onSuccess, onFailure) => {

    if (isDemoMode()) {
        const confirm = window.confirm(`[DEMO MODE] Simulate successful payment for ₹${amount}?`);
        if (confirm) {
            onSuccess({
                razorpay_payment_id: `pay_demo_${Date.now()}`,
                razorpay_order_id: `order_demo_${Date.now()}`,
                razorpay_signature: 'demo_signature'
            });
        } else {
            onFailure({
                error: {
                    code: 'PAYMENT_CANCELLED',
                    description: 'Payment cancelled by user (Demo)'
                }
            });
        }
        return;
    }

    const res = await loadRazorpay();

    if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
    }

    const order = await createOrder(amount, currency);

    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Replace with your Key ID
        amount: order.amount,
        currency: order.currency,
        name: name,
        description: description,
        image: '/logo.png', // Ensure you have a logo or remove this
        order_id: order.id,
        handler: function (response) {
            // Verify payment on backend
            onSuccess(response);
        },
        prefill: {
            name: prefill.name || '',
            email: prefill.email || '',
            contact: prefill.contact || ''
        },
        notes: {
            address: 'Zetta POS Corporate Office'
        },
        theme: theme
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
        onFailure(response);
    });

    paymentObject.open();
};
