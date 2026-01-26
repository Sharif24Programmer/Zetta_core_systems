import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { useAuth } from '../core/auth/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { demoLogin, refreshUser } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const from = location.state?.from?.pathname || '/app';

    const checkUserAndRedirect = async (user) => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // New user - create profile and redirect to setup
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'User',
                tenantId: null,
                role: null,
                provider: 'google',
                createdAt: serverTimestamp()
            });
            navigate('/setup');
            return;
        }

        const userData = userDoc.data();
        if (!userData.tenantId) {
            // No tenant - redirect to setup
            navigate('/setup');
        } else {
            // Has tenant - go to app
            if (refreshUser) await refreshUser();
            navigate(from, { replace: true });
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await checkUserAndRedirect(userCredential.user);
        } catch (err) {
            console.error('Login error:', err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please try again later.');
            } else {
                setError(err.message || 'Login failed');
            }
        }

        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            await checkUserAndRedirect(result.user);
        } catch (err) {
            console.error('Google login error:', err);
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(err.message || 'Google login failed');
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Zetta</h1>
                    <p className="text-primary-100">Multi-tenant POS Platform</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                        Welcome Back
                    </h2>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="input-field"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-slate-200"></div>
                        <span className="px-4 text-sm text-slate-500">or</span>
                        <div className="flex-1 border-t border-slate-200"></div>
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 rounded-xl py-3 px-4 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-medium text-slate-700">Continue with Google</span>
                    </button>

                    {/* Signup Link */}
                    <p className="mt-6 text-center text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary-600 font-medium hover:text-primary-700">
                            Sign up
                        </Link>
                    </p>

                    {/* Demo Mode */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Try Instant Demo (No Login)</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => import('../core/demo/demoService').then(m => m.startDemoMode('shop'))}
                                className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm"
                            >
                                🏪 Retail Shop
                            </button>
                            <button
                                type="button"
                                onClick={() => import('../core/demo/demoService').then(m => m.startDemoMode('clinic'))}
                                className="flex items-center justify-center gap-2 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium text-sm"
                            >
                                🏥 Clinic
                            </button>
                            <button
                                type="button"
                                onClick={() => import('../core/demo/demoService').then(m => m.startDemoMode('pharmacy'))}
                                className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium text-sm"
                            >
                                💊 Pharmacy
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-primary-100 text-xs mt-6">© 2026 Zetta Platform</p>
            </div>
        </div>
    );
};

export default Login;

