import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

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
            if (!tenantId || !user) {
                setLoading(false);
                return;
            }

            try {
                // Fetch tenant data to get all defined locations
                // Note: In a real app we might cache this or store it in user claims
                // For now, we assume tenant doc has a 'locations' array
                const tenantRef = doc(db, 'tenants', tenantId);
                const tenantSnap = await getDoc(tenantRef);

                let allLocations = [];
                if (tenantSnap.exists() && tenantSnap.data().locations) {
                    allLocations = tenantSnap.data().locations;
                } else {
                    // Default location if none defined
                    allLocations = [{ id: 'main', name: 'Main Clinic' }];
                }

                // Filter based on user access
                // If user has allowedLocations, use that. If not (or if admin), allow all.
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
