import { useState, useEffect } from 'react';
import { useValidBatches } from '../hooks/useBatches';
import ExpiryBadge from './ExpiryBadge';
import { formatExpiryDate, getExpiryStatus } from '../services/batchService';
import Loader from '../../../shared/components/Loader';

const BatchSelector = ({ productId, productName, onSelect, onClose }) => {
    const { batches, loading } = useValidBatches(productId);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [qty, setQty] = useState(1);

    const handleConfirm = () => {
        if (selectedBatch) {
            onSelect({
                batchId: selectedBatch.id,
                batchNo: selectedBatch.batchNo,
                expiryDate: selectedBatch.expiryDate,
                maxQty: selectedBatch.quantity,
                qty
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-auto animate-slideUp"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-slate-800">Select Batch</h3>
                        <p className="text-sm text-slate-500">{productName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Batch List */}
                {loading ? (
                    <Loader text="Loading batches..." />
                ) : batches.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p>No valid batches available</p>
                        <p className="text-sm mt-1">All batches may be expired or out of stock</p>
                    </div>
                ) : (
                    <div className="space-y-2 mb-4">
                        {batches.map(batch => {
                            const status = getExpiryStatus(batch);
                            const isSelected = selectedBatch?.id === batch.id;

                            return (
                                <div
                                    key={batch.id}
                                    onClick={() => setSelectedBatch(batch)}
                                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        } ${status === 'expired' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-800">
                                                    Batch: {batch.batchNo}
                                                </span>
                                                <ExpiryBadge expiryDate={batch.expiryDate} />
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Stock: <span className="font-medium">{batch.quantity}</span>
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Quantity Selector */}
                {selectedBatch && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Quantity (Max: {selectedBatch.quantity})
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold"
                            >
                                −
                            </button>
                            <input
                                type="number"
                                value={qty}
                                onChange={(e) => setQty(Math.min(selectedBatch.quantity, Math.max(1, Number(e.target.value))))}
                                className="w-20 text-center text-xl font-bold border border-slate-200 rounded-lg py-2"
                                min={1}
                                max={selectedBatch.quantity}
                            />
                            <button
                                onClick={() => setQty(q => Math.min(selectedBatch.quantity, q + 1))}
                                className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center font-bold"
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    disabled={!selectedBatch}
                    className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default BatchSelector;
