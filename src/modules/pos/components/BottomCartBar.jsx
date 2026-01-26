import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../services/billService';

const BottomCartBar = ({ itemCount, total }) => {
    const navigate = useNavigate();

    if (itemCount === 0) return null;

    return (
        <div className="fixed bottom-16 left-0 right-0 z-40 animate-slideUp">
            <div className="mx-4 mb-2">
                <button
                    onClick={() => navigate('/app/pos/cart')}
                    className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-xl py-3.5 px-5 shadow-lg flex items-center justify-between transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <span className="text-sm opacity-80">{itemCount} items</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{formatCurrency(total)}</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default BottomCartBar;
