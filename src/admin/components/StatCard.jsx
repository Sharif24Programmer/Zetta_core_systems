import React from 'react';

const StatCard = ({ title, value, change, changeType, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        yellow: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                    {change && (
                        <p className={`text-sm mt-2 flex items-center gap-1 ${changeType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {changeType === 'up' ? '↑' : '↓'} {change}
                            <span className="text-slate-400">vs last month</span>
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
