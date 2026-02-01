import React from 'react';
import { useLocation } from '../../core/context/LocationContext';

const LocationSelector = () => {
    const { selectedLocation, availableLocations, changeLocation, loading } = useLocation();

    if (loading || availableLocations.length <= 1) {
        return null; // Don't show if single location or loading
    }

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                    {availableLocations.find(l => l.id === selectedLocation)?.name || 'Select Location'}
                </span>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 hidden group-hover:block z-50">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                    Switch Location
                </div>
                {availableLocations.map(location => (
                    <button
                        key={location.id}
                        onClick={() => changeLocation(location.id)}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${selectedLocation === location.id ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-slate-600'
                            }`}
                    >
                        {location.name}
                        {selectedLocation === location.id && (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LocationSelector;
