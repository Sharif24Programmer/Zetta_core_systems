/**
 * Usage Banner Component
 * Shows when user is approaching usage limits
 */
const UsageBanner = ({ current, limit, feature, onUpgrade }) => {
    const percentage = Math.min((current / limit) * 100, 100);
    const isWarning = percentage >= 80;
    const isCritical = percentage >= 95;

    if (percentage < 70) return null;

    return (
        <div
            className={`p-3 rounded-xl mb-4 ${isCritical
                    ? 'bg-red-50 border border-red-200'
                    : isWarning
                        ? 'bg-orange-50 border border-orange-200'
                        : 'bg-slate-50 border border-slate-200'
                }`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isCritical ? 'text-red-700' : isWarning ? 'text-orange-700' : 'text-slate-700'
                    }`}>
                    {feature} Usage
                </span>
                <span className={`text-sm font-bold ${isCritical ? 'text-red-700' : isWarning ? 'text-orange-700' : 'text-slate-700'
                    }`}>
                    {current} / {limit}
                </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-primary-500'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {isCritical && (
                <button
                    onClick={onUpgrade}
                    className="w-full mt-3 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                    Upgrade Now to Continue
                </button>
            )}
        </div>
    );
};

export default UsageBanner;
