/**
 * Feature Locked Overlay
 * Blurs content and shows upgrade CTA when feature is locked
 */
const FeatureLockedOverlay = ({ feature, onUpgrade }) => {
    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
            {/* Blur Background */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>

            {/* Content */}
            <div className="relative z-10 text-center p-6 max-w-sm">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {feature} is Locked
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                    Upgrade your plan to unlock {feature.toLowerCase()} and grow your business.
                </p>
                <button
                    onClick={onUpgrade}
                    className="btn-primary px-6 py-2"
                >
                    Upgrade Now
                </button>
            </div>
        </div>
    );
};

export default FeatureLockedOverlay;
