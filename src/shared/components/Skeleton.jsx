import React from 'react';

const Skeleton = ({ className, variant = "rectangular", height, width }) => {
    const baseClasses = "animate-pulse bg-slate-200";
    const variantClasses = {
        text: "rounded",
        rectangular: "rounded-lg",
        circular: "rounded-full"
    };

    const style = {
        height: height,
        width: width
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
            style={style}
        />
    );
};

export const StatsSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 h-24 flex flex-col justify-center space-y-2">
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={16} />
            </div>
        ))}
    </div>
);

export const ListSkeleton = ({ rows = 3 }) => (
    <div className="space-y-3">
        {Array(rows).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-slate-100 flex items-center gap-4">
                <Skeleton variant="rectangular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="50%" height={20} />
                    <Skeleton variant="text" width="30%" height={14} />
                </div>
            </div>
        ))}
    </div>
);

export default Skeleton;
