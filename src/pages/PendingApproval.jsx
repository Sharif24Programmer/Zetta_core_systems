import { useAuth } from '../core/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
    const { signOut, user, userData } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">Verification Pending</h1>
                <p className="text-slate-600 mb-8">
                    Thanks for signing up, <span className="font-semibold">{userData?.name || user?.displayName}</span>!
                    Your account is currently under review by our admin team.
                    <br /><br />
                    You will receive an email once your subscription is active.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Check Status
                    </button>

                    <button
                        onClick={() => signOut().then(() => navigate('/login'))}
                        className="w-full py-2.5 px-4 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <p className="mt-8 text-sm text-slate-400">
                Need help? <a href="#" className="text-primary-600 hover:underline">Contact Support</a>
            </p>
        </div>
    );
};

export default PendingApproval;
