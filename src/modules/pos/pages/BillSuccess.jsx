import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useBill } from '../hooks/useBills';
import { formatCurrency } from '../services/billService';
import { generateReceipt, printReceipt, shareViaWhatsApp } from '../services/receiptService';
import Loader from '../../../shared/components/Loader';

const BillSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { billId } = useParams();

    // Get bill from location state or fetch it
    const billFromState = location.state?.bill;
    const { bill: fetchedBill, loading } = useBill(billFromState ? null : billId);
    const bill = billFromState || fetchedBill;

    const handlePrint = () => {
        if (bill) {
            const receipt = generateReceipt(bill);
            printReceipt(receipt);
        }
    };

    const handleWhatsApp = () => {
        if (bill) {
            const receipt = generateReceipt(bill);
            shareViaWhatsApp(receipt);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader text="Loading bill..." />
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="page-container">
                <div className="text-center py-12">
                    <p className="text-slate-500">Bill not found</p>
                    <button onClick={() => navigate('/app/pos')} className="btn-primary mt-4">
                        Go to POS
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
            {/* Success Animation */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-[bounce_0.5s_ease-in-out]">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h1>
                <p className="text-slate-500 mb-6">Bill has been saved</p>

                {/* Bill Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
                    <p className="text-sm text-slate-500 mb-1">Bill Number</p>
                    <p className="text-lg font-bold text-slate-800 mb-4">{bill.billNumber}</p>

                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-sm text-slate-500 mb-1">Amount</p>
                        <p className="text-3xl font-bold text-primary-600">
                            {formatCurrency(bill.total)}
                        </p>
                    </div>

                    {bill.paymentMode === 'cash' && bill.change > 0 && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600">Return Change</p>
                            <p className="text-xl font-bold text-green-700">
                                {formatCurrency(bill.change)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="p-6 space-y-3 safe-area-bottom">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handlePrint}
                        className="btn-secondary py-3 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                    </button>
                    <button
                        onClick={handleWhatsApp}
                        className="btn-secondary py-3 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                    </button>
                </div>

                <button
                    onClick={() => navigate('/app/pos/new')}
                    className="w-full btn-primary py-4 text-lg font-bold"
                >
                    New Bill
                </button>
            </div>
        </div>
    );
};

export default BillSuccess;
