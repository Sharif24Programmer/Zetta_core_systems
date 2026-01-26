const QtyControl = ({ qty, onIncrement, onDecrement, size = 'normal' }) => {
    const sizeClasses = {
        small: 'w-6 h-6 text-sm',
        normal: 'w-8 h-8 text-base',
        large: 'w-10 h-10 text-lg'
    };

    const qtyClasses = {
        small: 'w-8 text-sm',
        normal: 'w-10 text-base',
        large: 'w-12 text-lg'
    };

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={onDecrement}
                className={`${sizeClasses[size]} rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 font-bold transition-colors`}
            >
                −
            </button>
            <span className={`${qtyClasses[size]} text-center font-semibold text-slate-800`}>
                {qty}
            </span>
            <button
                onClick={onIncrement}
                className={`${sizeClasses[size]} rounded-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 flex items-center justify-center text-white font-bold transition-colors`}
            >
                +
            </button>
        </div>
    );
};

export default QtyControl;
