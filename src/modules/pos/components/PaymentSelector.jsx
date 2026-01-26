const PaymentSelector = ({ selected, onChange }) => {
    const methods = [
        {
            id: 'cash',
            label: 'Cash',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            id: 'upi',
            label: 'UPI',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            id: 'card',
            label: 'Card',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )
        }
    ];

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
                Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
                {methods.map(method => (
                    <button
                        key={method.id}
                        type="button"
                        onClick={() => onChange(method.id)}
                        className={`
              flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
              ${selected === method.id
                                ? 'border-primary-500 bg-primary-50 text-primary-600'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }
            `}
                    >
                        {method.icon}
                        <span className="mt-2 text-sm font-medium">{method.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PaymentSelector;
