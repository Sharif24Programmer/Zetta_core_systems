import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getTenant } from '../tenant/tenantService';
import { getSubscription } from '../subscription/subscriptionService';
import { getPlan, DEFAULT_PLANS } from '../subscription/planService';
import { ROLES } from '../roles/roleService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load full user context
    const loadUserContext = async (firebaseUser) => {
        try {
            // 1. Get user document
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

            let userInfo;
            if (userDoc.exists()) {
                userInfo = userDoc.data();
            } else {
                // Default for new users
                userInfo = {
                    tenantId: 'default',
                    role: ROLES.OWNER,
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email
                };
            }
            setUserData(userInfo);

            // 2. Get tenant
            const tenantData = await getTenant(userInfo.tenantId);
            setTenant(tenantData);

            // 3. Get subscription
            const subscriptionData = await getSubscription(userInfo.tenantId);
            setSubscription(subscriptionData);

            // 4. Get plan
            if (subscriptionData?.planId) {
                const planData = await getPlan(subscriptionData.planId) || DEFAULT_PLANS[subscriptionData.planId];
                setPlan(planData);
            } else {
                setPlan(DEFAULT_PLANS.free);
            }

        } catch (err) {
            console.error('Error loading user context:', err);
            setError(err.message);
            // Set defaults on error
            setUserData({ tenantId: 'default', role: ROLES.STAFF, name: 'User' });
            setPlan(DEFAULT_PLANS.free);
        }
    };

    // Demo mode login
    const loadDemoUser = () => {
        const isDemo = localStorage.getItem('zetta_is_demo') === 'true';
        if (isDemo) {
            const demoUser = JSON.parse(localStorage.getItem('zetta_user') || '{}');
            const demoTenant = JSON.parse(localStorage.getItem('zetta_current_tenant') || '{}');

            setUser({ uid: demoUser.uid, email: demoUser.email });
            setUserData({
                tenantId: demoUser.tenantId || demoTenant.id,
                role: demoUser.role,
                name: demoUser.displayName,
                demo: true
            });
            setTenant(demoTenant);

            // Assume Pro/Enterprise subscription for Demo
            setSubscription({
                tenantId: demoTenant.id,
                planId: demoTenant.planId || 'enterprise',
                status: 'active',
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            });

            // Load plan features
            const planDetails = DEFAULT_PLANS[demoTenant.planId || 'enterprise'];
            setPlan(planDetails);

            return true;
        }
        return false;
    };

    useEffect(() => {
        // Check demo mode first
        if (loadDemoUser()) {
            setLoading(false);
            return;
        }

        // Firebase auth listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                await loadUserContext(firebaseUser);
            } else {
                setUser(null);
                setUserData(null);
                setTenant(null);
                setSubscription(null);
                setPlan(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Sign in with email/password
    const signIn = async (email, password) => {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: result.user };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Sign up new user
    const signUp = async (email, password, name, tenantId = null) => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Create user document
            const newTenantId = tenantId || `tenant_${result.user.uid}`;
            await setDoc(doc(db, 'users', result.user.uid), {
                email,
                name,
                tenantId: newTenantId,
                role: ROLES.OWNER,
                createdAt: serverTimestamp()
            });

            return { success: true, user: result.user };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Sign out (Updated to clear demo state)
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);

            // Clear all local storage
            localStorage.clear();
            // Or use demoService.exitDemoMode() logic if imported

            setUser(null);
            setUserData(null);
            setTenant(null);
            setSubscription(null);
            setPlan(null);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Legacy demo login (Redirect to use demoService)
    const demoLogin = (role, planId) => {
        console.warn('Use demoService.startDemoMode instead');
        import('../demo/demoService').then(m => m.startDemoMode(role === 'owner' ? 'shop' : 'clinic'));
    };

    // Helper methods
    const isAuthenticated = () => !!user;
    const isSuperAdmin = () => userData?.role === ROLES.SUPER_ADMIN;
    const isAdmin = () => userData?.role === ROLES.ADMIN || userData?.role === ROLES.SUPER_ADMIN;
    const isOwner = () => userData?.role === ROLES.OWNER || isAdmin();

    const hasFeature = (feature) => {
        return plan?.features?.[feature] === true;
    };

    const isSubscribed = () => {
        if (!subscription) return false;
        if (subscription.status !== 'active' && subscription.status !== 'trial') return false;

        const endDate = subscription.endDate?.toDate?.() || new Date(subscription.endDate);
        return endDate > new Date();
    };

    const value = {
        // State
        user,
        userData,
        tenant,
        subscription,
        plan,
        loading,
        error,

        // Auth methods
        signIn,
        signUp,
        signOut,
        demoLogin,

        // Helpers
        isAuthenticated,
        isSuperAdmin,
        isAdmin,
        isOwner,
        hasFeature,
        isSubscribed,

        // Quick accessors
        tenantId: userData?.tenantId || 'default',
        userId: user?.uid || null,
        userName: userData?.name || 'User',
        userRole: userData?.role || ROLES.STAFF,
        planId: plan?.id || 'free'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
