import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { isDemoMode } from '../demo/demoManager';

const LocationContext = createContext();

export const useLocation = () => {
    return useContext(LocationContext);
};

export const LocationProvider = ({ children }) => {
    const { user, tenantId, userData } = useAuth();
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            if (!tenantId && !isDemoMode()) {
                setLoading(false);
                return;
            }

            // Demo Mode Bypass
            if (isDemoMode(tenantId)) {
                const mockLocs = [
                    { id: 'main', name: 'Main Branch (Demo)' },
                    { id: 'downtown', name: 'Downtown Clinic (Demo)' }
                ];
                setAvailableLocations(mockLocs);
                setSelectedLocation(mockLocs[0].id);
                setLoading(false);
                return;
            }

            try {
                // Fetch tenant data to get all defined locations
                const tenantRef = doc(db, 'tenants', tenantId);
                const tenantSnap = await getDoc(tenantRef);

                let allLocations = [];
                if (tenantSnap.exists() && tenantSnap.data().locations) {
                    allLocations = tenantSnap.data().locations;
                } else {
                    allLocations = [{ id: 'main', name: 'Main Clinic' }];
                }

                // Filter based on user access
                let allowed = allLocations;
                if (userData?.allowedLocations && userData.allowedLocations.length > 0 && userData.role !== 'admin') {
                    allowed = allLocations.filter(loc => userData.allowedLocations.includes(loc.id));
                }

                setAvailableLocations(allowed);

                // Initialize selection
                const saved = localStorage.getItem(`zetta_location_${tenantId}`);
                if (saved && allowed.find(l => l.id === saved)) {
                    setSelectedLocation(saved);
                } else if (allowed.length > 0) {
                    setSelectedLocation(allowed[0].id);
                }

            } catch (error) {
                console.error("Error fetching locations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, [tenantId, user, userData]);

    const changeLocation = (locationId) => {
        if (availableLocations.find(l => l.id === locationId)) {
            setSelectedLocation(locationId);
            localStorage.setItem(`zetta_location_${tenantId}`, locationId);
            // Optional: Reload page to force refresh all data subscriptions
            // window.location.reload(); 
        }
    };

    const getLocationName = (locationId) => {
        const loc = availableLocations.find(l => l.id === locationId);
        return loc ? loc.name : 'Unknown Location';
    };

    const value = {
        selectedLocation,
        availableLocations,
        changeLocation,
        getLocationName,
        loading
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};
