import React from 'react';

const LoadingFallback = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-slate-600 font-medium">Loading Zetta POS...</p>
            </div>
        </div>
    );
};

export default LoadingFallback;
