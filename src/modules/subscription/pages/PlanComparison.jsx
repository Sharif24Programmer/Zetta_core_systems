import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { SUBSCRIPTION_PLANS } from '../data/plans';
import { formatCurrency } from '../../../modules/pos/services/billService';

const PlanComparison = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSelectPlan = (planId) => {
        // In real app, redirect to payment gateway
        console.log('Selected plan:', planId);
        navigate(`/app/subscription/checkout/${planId}`);
    };

    return (
        <div className="page-container">
            <div className="text-center py-10">
                <h1 className="text-4xl font-bold text-slate-800 mb-4">Choose Your Plan</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Scale your business with the right tools. Change plans anytime.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                {SUBSCRIPTION_PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`
                            relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 transition-all hover:-translate-y-1
                            ${plan.popular ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-slate-100'}
                        `}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                POPULAR
                            </div>
                        )}

                        <div className="p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                            <p className="text-slate-500 text-sm mb-6">{plan.description}</p>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold text-slate-900">
                                    {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                                </span>
                                {plan.price > 0 && (
                                    <span className="text-slate-500">/{plan.interval}</span>
                                )}
                            </div>

                            <button
                                onClick={() => handleSelectPlan(plan.id)}
                                className={`
                                    w-full py-3 rounded-xl font-bold mb-8 transition-colors
                                    ${plan.popular
                                        ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/30'
                                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}
                                `}
                            >
                                {plan.price === 0 ? 'Get Started' : 'Upgrade Now'}
                            </button>

                            <div className="space-y-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Includes:
                                </p>
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm text-slate-600">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlanComparison;
