import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useAuth } from '../core/auth/AuthContext';
import { DEFAULT_PLANS } from '../core/subscription/planService';
import Loader from '../shared/components/Loader';

const BUSINESS_TYPES = [
    {
        id: 'medical',
        name: 'Pharmacy / Medical',
        description: 'For pharmacies and medical stores. Includes features for patient management, prescriptions, and expiry tracking.',
        icon: '💊',
        color: 'from-green-500 to-green-600',
        features: ['Prescriptions', 'Patients', 'Expiry Alerts', 'Batch Tracking']
    },
    {
        id: 'shop',
        name: 'Retail / Supermarket',
        description: 'For general retail stores. Includes features for quick billing, barcode scaling, and customer loyalty.',
        icon: '🏪',
        color: 'from-blue-500 to-blue-600',
        features: ['Quick Billing', 'Barcode Scales', 'Loyalty Points', 'Inventory']
    },
    {
        id: 'clinic',
        name: 'Clinic / Hospital',
        description: 'For doctors and small clinics. Includes appointment scheduling, patient history, and consulting billing.',
        icon: '🏥',
        color: 'from-purple-500 to-purple-600',
        features: ['Appointments', 'Patient History', 'Consulting', 'Prescriptions']
    }
];

const BusinessSetup = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [businessName, setBusinessName] = useState('');
    const [themeColor, setThemeColor] = useState('blue');
    const [paymentRef, setPaymentRef] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setStep(2);
    };

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setStep(3);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleProfileSubmit = () => {
        if (!businessName.trim()) {
            setError('Please enter a business name');
            return;
        }
        setError(null);
        setStep(4);
    };

    const handleFinalSubmit = async () => {
        // If not free, require payment ref (basic validation)
        if (selectedPlan.price > 0 && !paymentRef.trim()) {
            setError('Please enter the payment reference/transaction ID');
            return;
        }

        if (!user?.uid) {
            setError('User not authenticated');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const tenantRef = doc(db, 'tenants', tenantId);

            await setDoc(tenantRef, {
                name: businessName.trim(),
                type: selectedType.id,
                ownerId: user.uid,
                planId: selectedPlan.id, // Store plan
                subscriptionStatus: selectedPlan.price === 0 ? 'active' : 'pending_payment',
                paymentRef: paymentRef || null,
                isActive: selectedPlan.price === 0, // Auto-activate free tier
                theme: themeColor,
                createdAt: serverTimestamp()
            });

            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                tenantId: tenantId,
                role: 'owner',
                updatedAt: serverTimestamp()
            });

            if (refreshUser) {
                await refreshUser();
            }

            // Redirect based on activation
            if (selectedPlan.price === 0) {
                navigate('/app');
            } else {
                // In real app, show a "Pending Approval" screen. 
                // For now, we'll let them in but functionality might be limited or we just navigate to app
                // and assume admin approves instantly in this demo.
                alert('Account created! An admin will verify your payment shortly.');
                navigate('/app');
            }
        } catch (err) {
            console.error('Business setup error:', err);
            setError(err.message || 'Failed to create business');
        }

        setLoading(false);
    };

    // Step 1: Choose Business Type
    if (step === 1) {
        return (
            <div className="setup-container relative">
                <div className="absolute top-4 right-4">
                    <button
                        onClick={() => auth.signOut()}
                        className="text-sm text-slate-500 hover:text-red-600 font-medium px-4 py-2"
                    >
                        Sign Out
                    </button>
                </div>
                <div className="setup-wrapper max-w-5xl">
                    <SetupHeader title="Welcome to Zetta POS 👋" subtitle="To get started, please tell us what kind of business you run." />
                    <div className="grid md:grid-cols-3 gap-6">
                        {BUSINESS_TYPES.map(type => (
                            <button key={type.id} onClick={() => handleTypeSelect(type)} className="setup-card group">
                                <div className="setup-card-icon-bg">{type.icon}</div>
                                <div className={`setup-icon ${type.color}`}>{type.icon}</div>
                                <h3 className="setup-card-title">{type.name}</h3>
                                <p className="setup-card-desc">{type.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Choose Plan
    if (step === 2) {
        return (
            <div className="setup-container">
                <div className="setup-wrapper max-w-6xl">
                    <SetupHeader title="Select Your Scale 🚀" subtitle="Choose a plan that fits your business size." />

                    <div className="grid md:grid-cols-4 gap-4">
                        {Object.values(DEFAULT_PLANS).map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => handlePlanSelect(plan)}
                                className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-primary-500 hover:shadow-xl transition-all text-left flex flex-col h-full relative"
                            >
                                {plan.id === 'growth' && <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold">POPULAR</div>}
                                <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                                <div className="mt-2 mb-4">
                                    <span className="text-3xl font-bold text-slate-900">₹{plan.price}</span>
                                    <span className="text-slate-500 text-sm">/mo</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4 h-10">{plan.recommendedFor}</p>

                                <div className="space-y-2 mt-auto pt-4 border-t border-slate-100">
                                    <div className="flex items-center text-sm text-slate-700">
                                        <span className="mr-2">👥</span> {plan.limits.staff} Staff
                                    </div>
                                    <div className="flex items-center text-sm text-slate-700">
                                        <span className="mr-2">📦</span> {plan.limits.products} Products
                                    </div>
                                    <div className="flex items-center text-sm text-slate-700">
                                        <span className="mr-2">📄</span> {plan.limits.bills} Bills/mo
                                    </div>
                                    {plan.features.lab_module && (
                                        <div className="flex items-center text-sm text-purple-600 font-medium">
                                            <span className="mr-2">🧪</span> Lab Module
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <button onClick={handleBack} className="text-slate-500 hover:text-slate-800">← Back</button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Setup Profile
    if (step === 3) {
        return (
            <div className="setup-container">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <SetupHeader title={`Name Your ${selectedType.name}`} subtitle="This will be displayed on receipts." compact />

                    {error && <ErrorMessage message={error} />}

                    <div className="space-y-6">
                        <div>
                            <label className="label">Business Name</label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder={`e.g. City ${selectedType.name.split('/')[0]}`}
                                className="input-field"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="label">Theme Color</label>
                            <div className="flex gap-4 justify-center">
                                {['blue', 'green', 'purple', 'orange'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setThemeColor(color)}
                                        className={`w-10 h-10 rounded-full bg-${color}-500 transition-transform ${themeColor === color ? 'ring-4 ring-slate-200 scale-110' : 'hover:scale-110'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleBack} className="btn-secondary flex-1">Back</button>
                            <button
                                onClick={handleProfileSubmit}
                                disabled={!businessName.trim()}
                                className="btn-primary flex-[2]"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Step 4: Payment (If Paid Plan)
    return (
        <div className="setup-container">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <SetupHeader title="Secure Payment 🔒" subtitle={`Complete your subscription for ${selectedPlan.name} Plan.`} compact />

                {error && <ErrorMessage message={error} />}

                {selectedPlan.price === 0 ? (
                    <div className="text-center py-6">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-slate-800">Free Tier Activated!</h3>
                        <p className="text-slate-500 mt-2">No payment required. Let's get started.</p>
                        <button onClick={handleFinalSubmit} className="btn-primary w-full mt-6">
                            {loading ? <Loader size="small" /> : 'Enter Dashboard'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="text-sm text-slate-500 mb-1">Transfer Amount</p>
                            <p className="text-2xl font-bold text-slate-900">₹{selectedPlan.price}</p>
                            <div className="my-3 border-t border-slate-200"></div>
                            <p className="text-sm font-semibold text-slate-700">Bank Details:</p>
                            <p className="text-sm text-slate-600">Acct: 9876543210</p>
                            <p className="text-sm text-slate-600">IFSC: HDFC0001234</p>
                            <p className="text-sm text-slate-600">Name: Zetta POS Solutions</p>
                        </div>

                        <div>
                            <label className="label">Enter Transaction / Reference ID</label>
                            <input
                                type="text"
                                value={paymentRef}
                                onChange={(e) => setPaymentRef(e.target.value)}
                                placeholder="e.g. UPI-1234567890"
                                className="input-field"
                            />
                            <p className="text-xs text-slate-500 mt-1">Admin will verify this ID to activate your account.</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleBack} disabled={loading} className="btn-secondary flex-1">Back</button>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={loading || !paymentRef.trim()}
                                className="btn-primary flex-[2]"
                            >
                                {loading ? <Loader size="small" /> : 'Submit & Launch'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-components for cleaner code ---
const SetupHeader = ({ title, subtitle, compact }) => (
    <div className={`text-center ${compact ? 'mb-8' : 'mb-10'}`}>
        <h1 className={`${compact ? 'text-2xl' : 'text-4xl'} font-bold text-slate-900 mb-2`}>{title}</h1>
        <p className={`${compact ? 'text-sm' : 'text-lg'} text-slate-600`}>{subtitle}</p>
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center">
        <span className="mr-2">⚠️</span> {message}
    </div>
);

// Styles
const styles = `
    .setup-container { @apply min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4; }
    .setup-wrapper { @apply w-full; }
    .setup-card { @apply group bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-primary-500 hover:shadow-xl transition-all text-left relative overflow-hidden; }
    .setup-card-icon-bg { @apply absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl; }
    .setup-icon { @apply w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform; }
    .setup-card-title { @apply font-bold text-xl text-slate-900 mb-2; }
    .setup-card-desc { @apply text-sm text-slate-500 mb-4 min-h-[40px]; }
    .label { @apply block text-sm font-semibold text-slate-700 mb-2; }
    .input-field { @apply w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none; }
    .btn-primary { @apply px-4 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 transition-all; }
    .btn-secondary { @apply px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors; }
`;

export default BusinessSetup;
