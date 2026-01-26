import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlanComparison from './PlanComparison';

const UpgradePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
                <div onClick={() => navigate('/app')} className="cursor-pointer flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Z</span>
                    </div>
                    <span className="font-bold text-xl text-slate-800">Zetta POS</span>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-500 hover:text-slate-800 font-medium"
                >
                    Close
                </button>
            </div>

            {/* Content using PlanComparison */}
            <div className="pt-20 pb-20">
                <PlanComparison />
            </div>

            {/* Trust Badges */}
            <div className="bg-white py-12 border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-slate-400 font-medium mb-6 uppercase tracking-widest text-xs">Trusted by 500+ Businesses</p>
                    <div className="flex justify-center gap-12 opacity-50 grayscale">
                        {/* Placeholders for logos */}
                        <div className="h-8 w-24 bg-slate-200 rounded"></div>
                        <div className="h-8 w-24 bg-slate-200 rounded"></div>
                        <div className="h-8 w-24 bg-slate-200 rounded"></div>
                        <div className="h-8 w-24 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;
