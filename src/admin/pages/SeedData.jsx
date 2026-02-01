import { useState } from 'react';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { DEFAULT_PLANS } from '../../core/subscription/planService';

const SeedData = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [existingPlans, setExistingPlans] = useState([]);

    const checkExisting = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'plans'));
            setExistingPlans(snap.docs.map(d => d.id));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const seedPlans = async () => {
        setLoading(true);
        setResult(null);
        try {
            const batch = [];

            for (const [key, plan] of Object.entries(DEFAULT_PLANS)) {
                await setDoc(doc(db, 'plans', plan.id), {
                    ...plan,
                    updatedAt: new Date()
                });
                batch.push(plan.name);
            }

            setResult({
                success: true,
                message: `Successfully seeded ${batch.length} plans: ${batch.join(', ')}`
            });
            checkExisting();
        } catch (err) {
            console.error(err);
            setResult({
                success: false,
                message: `Error seeding plans: ${err.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Database Seeding Utility</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
                <h2 className="text-lg font-semibold mb-4">Subscription Plans</h2>
                <p className="text-slate-600 mb-4">
                    Syncs the hardcoded `DEFAULT_PLANS` from code to the Firestore `plans` collection.
                    This allows the Admin UI to fetch plans dynamically.
                </p>

                <div className="flex gap-4 items-center">
                    <button
                        onClick={seedPlans}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {loading ? 'Syncing...' : 'Sync Plans to Firestore'}
                    </button>

                    <button
                        onClick={checkExisting}
                        className="text-slate-500 hover:text-slate-800"
                    >
                        Check Existing
                    </button>
                </div>

                {result && (
                    <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {result.message}
                    </div>
                )}

                {existingPlans.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm font-semibold text-slate-500 mb-2">Found in DB:</p>
                        <div className="flex gap-2">
                            {existingPlans.map(id => (
                                <span key={id} className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                                    {id}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeedData;
