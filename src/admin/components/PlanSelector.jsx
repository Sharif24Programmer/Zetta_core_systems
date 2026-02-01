import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { formatCurrency } from '../../modules/pos/services/billService';

const PlanSelector = ({ selectedPlanId, onSelect }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const snap = await getDocs(collection(db, 'plans'));
                setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error("Error fetching plans:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    if (loading) return <div className="text-sm text-slate-500">Loading plans...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => (
                <div
                    key={plan.id}
                    onClick={() => onSelect(plan.id)}
                    className={`cursor-pointer border rounded-lg p-4 transition-all ${selectedPlanId === plan.id
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                            : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                        }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800 capitalize">{plan.name}</h4>
                        {selectedPlanId === plan.id && (
                            <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">Selected</span>
                        )}
                    </div>
                    <p className="text-lg font-bold text-slate-900 mb-1">
                        {formatCurrency(plan.price)}
                        <span className="text-sm font-normal text-slate-500">/{plan.billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2">{plan.recommendedFor}</p>
                </div>
            ))}
        </div>
    );
};

export default PlanSelector;
