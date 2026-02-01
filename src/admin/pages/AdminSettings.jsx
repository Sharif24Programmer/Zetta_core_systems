import React from 'react';
import { AdminIcons as Icons } from '../components/AdminIcons';

const AdminSettings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-1">Configure system preferences</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {Icons.settings}
                </div>
                <h3 className="font-semibold text-slate-900">System Settings</h3>
                <p className="text-slate-500 mt-2">Configuration options coming soon</p>
            </div>
        </div>
    );
};

export default AdminSettings;
