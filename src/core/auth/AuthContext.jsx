import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../../services/firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    console.log('AuthProvider Iniitalizing');
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load full user context from Firestore
    const loadUserContext = async (firebaseUser) => {
        try {
            // 1. Get user document from Firestore
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Profile might not exist yet during signup (race condition)
                // proper flow will create it shortly.
                setUserData(null);
                setTenant(null);
                return;
            }

            const userInfo = userDoc.data();
            setUserData(userInfo);

            // 2. Check if user has a tenantId
            if (!userInfo.tenantId) {
                // New user flow - allow access to setup pages, but no tenant data yet
                setTenant(null);
                setError(null);
                return;
            }

            // 3. Get tenant data
            const tenantDocRef = doc(db, 'tenants', userInfo.tenantId);
            const tenantDoc = await getDoc(tenantDocRef);

            if (!tenantDoc.exists()) {
                throw new Error('Shop not found. Please contact support.');
            }

            const tenantData = {
                id: tenantDoc.id,
                ...tenantDoc.data()
            };

            setTenant(tenantData);
            setError(null);

        } catch (err) {
            console.error('Error loading user context:', err);
            setError(err.message);
            // Sign out if context loading fails
            await firebaseSignOut(auth);
            throw err;
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        // CHECK DEMO MODE FIRST - Skip Firebase entirely
        const checkDemoMode = () => {
            const isDemoActive = localStorage.getItem('zetta_demo_mode') === 'true';
            if (isDemoActive) {
                const demoUser = {
                    uid: 'demo_user_001',
                    email: 'demo@zettapos.com',
                    displayName: 'Demo User'
                };
                const demoTenant = JSON.parse(localStorage.getItem('zetta_demo_tenant') || '{}');
                const demoUserData = {
                    tenantId: 'demo_tenant_001',
                    role: 'admin',
                    displayName: 'Demo User',
                    email: 'demo@zettapos.com',
                    demo: true
                };

                setUser(demoUser);
                setUserData(demoUserData);
                setTenant(demoTenant);
                setLoading(false);
                return true; // Demo mode active
            }
            return false; // Not in demo mode
        };

        // If demo mode is active, skip Firebase listener
        if (checkDemoMode()) {
            return; // Exit early, no cleanup needed
        }

        // PRODUCTION MODE: Setup Firebase listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    setUser(firebaseUser);
                    await loadUserContext(firebaseUser);
                } catch (err) {
                    // Error already handled in loadUserContext
                    setUser(null);
                    setUserData(null);
                    setTenant(null);
                }
            } else {
                setUser(null);
                setUserData(null);
                setTenant(null);
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
            // loadUserContext will be called by onAuthStateChanged
            return { success: true, user: result.user };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // loadUserContext will be called by onAuthStateChanged
            return { success: true, user: result.user };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Sign up new user
    const signUp = async (email, password, displayName, tenantData = null) => {
        try {
            setError(null);

            // 1. Create Firebase auth user
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = result.user;

            // 2. Create tenant if provided (for new signups)
            let tenantId = tenantData?.id || null;

            if (tenantData) {
                const tenantDocRef = doc(db, 'tenants', tenantData.id || `tenant_${Date.now()}`);
                await setDoc(tenantDocRef, {
                    name: tenantData.name,
                    type: tenantData.type || 'clinic',
                    email: email,
                    phone: tenantData.phone || '',
                    address: tenantData.address || {},
                    subscription: {
                        plan: 'free',
                        status: 'trial',
                        startDate: serverTimestamp(),
                        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 day trial
                    },
                    modules: {
                        pos: true,
                        inventory: true,
                        patients: true,
                        lab: false,
                        pharmacy: false
                    },
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                tenantId = tenantDocRef.id;
            }

            // 3. Create user document in Firestore
            await setDoc(doc(db, 'users', newUser.uid), {
                name: displayName, // Store name at top level too
                email: email,
                displayName: displayName,
                tenantId: tenantId,
                role: 'admin', // First user is Admin of their shop

                // Subscription Fields
                subscriptionStatus: 'pending', // Default to pending for approval
                planId: tenantData?.planId || 'basic',
                billingCycle: tenantData?.billingCycle || 'monthly',

                apps: {
                    core: true,
                    admin: false,
                    support: true
                },
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });

            return { success: true, user: newUser };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);
            setTenant(null);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Helper: Check if user has a specific feature
    const hasFeature = (featureName) => {
        // In demo mode, enable all features
        if (localStorage.getItem('zetta_demo_mode') === 'true') {
            return true;
        }

        // Check tenant's plan features
        // For now, return true for all features (you can implement proper feature checking later)
        return true;
    };

    // Helper: Check if user is super admin
    const isSuperAdmin = () => {
        if (localStorage.getItem('zetta_demo_mode') === 'true') {
            return false; // Demo users are not super admins
        }
        return userData?.role === 'super_admin';
    };

    // Helper: Get user's display name
    const userName = user?.displayName || userData?.displayName || userData?.name || 'User';

    // Helper: Get plan info (mock for now)
    const plan = {
        name: tenant?.planId || 'Free',
        features: []
    };

    const value = {
        user,
        userData,
        tenant,
        tenantId: tenant?.id || userData?.tenantId,
        loading,
        error,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        // Helper functions
        hasFeature,
        isSuperAdmin,
        userName,
        plan
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
