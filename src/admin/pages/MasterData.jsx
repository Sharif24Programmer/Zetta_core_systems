import React, { useState } from 'react';
import { AdminIcons as Icons } from '../components/AdminIcons';

const MasterData = () => {
    const [activeTab, setActiveTab] = useState('medicines'); // medicines, lab
    const [searchQuery, setSearchQuery] = useState('');

    const [medicines, setMedicines] = useState([
        { id: 1, name: 'Paracetamol 650mg', type: 'Tablet', manufacturer: 'Global Pharma', category: 'Analgesic' },
        { id: 2, name: 'Amoxicillin 500mg', type: 'Capsule', manufacturer: 'MediCorp', category: 'Antibiotic' },
        { id: 3, name: 'Cetirizine 10mg', type: 'Tablet', manufacturer: 'HealthCare Inc', category: 'Antihistamine' },
        { id: 4, name: 'Metformin 500mg', type: 'Tablet', manufacturer: 'DiabCare', category: 'Antidiabetic' },
        { id: 5, name: 'Pantoprazole 40mg', type: 'Tablet', manufacturer: 'GastroLive', category: 'Antacid' },
    ]);

    const [labTests, setLabTests] = useState([
        { id: 1, name: 'Complete Blood Count (CBC)', code: 'CBC', params: 14, category: 'Hematology' },
        { id: 2, name: 'Lipid Profile', code: 'LIPID', params: 5, category: 'Biochemistry' },
        { id: 3, name: 'Thyroid Profile (T3, T4, TSH)', code: 'THYROID', params: 3, category: 'Biochemistry' },
        { id: 4, name: 'Liver Function Test', code: 'LFT', params: 8, category: 'Biochemistry' },
    ]);

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredLabTests = labTests.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Data</h1>
                    <p className="text-slate-500 mt-1">Manage global database accessible to all tenants</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                        />
                        <div className="absolute left-3 top-2.5 text-slate-400">
                            {Icons.search}
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        {Icons.plus}
                        Add New
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('medicines')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'medicines'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Medicines Database
                </button>
                <button
                    onClick={() => setActiveTab('lab')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'lab'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Lab Test Templates
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {activeTab === 'medicines' ? (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Active Ingredient / Name</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Manufacturer</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMedicines.map(med => (
                                <tr key={med.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 font-medium text-slate-900">{med.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{med.type}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                                            {med.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{med.manufacturer}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredMedicines.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No medicines found matching "{searchQuery}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Test Name</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Code</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
                                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Parameters</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLabTests.map(test => (
                                <tr key={test.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 font-medium text-slate-900">{test.name}</td>
                                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{test.code}</td>
                                    <td className="px-6 py-4 text-slate-600">{test.category}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
                                            {test.params} Params
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Configure</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MasterData;
