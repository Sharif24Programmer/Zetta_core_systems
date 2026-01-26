import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { createTicket, TICKET_TYPES, PRIORITY } from '../services/ticketService';
import { uploadMultipleImages } from '../services/uploadService';
import ImageUploader from '../../../shared/components/ImageUploader';
import Loader from '../../../shared/components/Loader';

const CreateTicket = () => {
    const navigate = useNavigate();
    const { tenantId, userId, userName } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: TICKET_TYPES.GENERAL,
        priority: PRIORITY.MEDIUM
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.title.trim()) {
            setError('Please enter a title');
            return;
        }

        if (!formData.description.trim()) {
            setError('Please enter a description');
            return;
        }

        setLoading(true);

        try {
            // Create ticket first
            const ticketData = {
                tenantId,
                createdBy: userId,
                createdByName: userName,
                title: formData.title.trim(),
                description: formData.description.trim(),
                type: formData.type,
                priority: formData.priority
            };

            const newTicket = await createTicket(ticketData);

            // Upload images if any
            if (images.length > 0) {
                await uploadMultipleImages(images, tenantId, newTicket.id);
            }

            // Navigate to ticket chat
            navigate(`/app/support/tickets/${newTicket.id}`);
        } catch (err) {
            console.error('Error creating ticket:', err);
            setError('Failed to create ticket. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/app/support')}
                        className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="page-title">Create Ticket</h1>
                </div>
            </div>

            {/* Form */}
            <div className="page-content">
                {loading ? (
                    <Loader text="Creating ticket..." />
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Issue Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Issue Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="input-field"
                            >
                                {Object.entries(TICKET_TYPES).map(([key, value]) => (
                                    <option key={key} value={value}>
                                        {key.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Brief summary of your issue"
                                className="input-field"
                                maxLength={100}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Please describe your issue in detail..."
                                className="input-field min-h-[150px] resize-none"
                                maxLength={1000}
                            />
                            <p className="text-xs text-slate-400 mt-1 text-right">
                                {formData.description.length}/1000
                            </p>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Priority
                            </label>
                            <div className="flex gap-3">
                                {Object.entries(PRIORITY).map(([key, value]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, priority: value }))}
                                        className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium text-sm transition-all ${formData.priority === value
                                                ? value === 'high'
                                                    ? 'border-red-500 bg-red-50 text-red-700'
                                                    : value === 'medium'
                                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                        : 'border-slate-500 bg-slate-50 text-slate-700'
                                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        {key.charAt(0) + key.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Attachments (optional)
                            </label>
                            <ImageUploader onImageSelect={setImages} maxImages={3} />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full btn-primary py-3.5 text-base"
                        >
                            Submit Ticket
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateTicket;
