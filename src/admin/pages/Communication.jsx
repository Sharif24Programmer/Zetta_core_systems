import React, { useState } from 'react';
import { AdminIcons as Icons } from '../components/AdminIcons';

const Communication = () => {
    const [activeTab, setActiveTab] = useState('announcements'); // announcements, tickets
    const [tickets, setTickets] = useState([
        { id: 'TKT-2024', subject: 'Lab Report Generation Error', tenant: 'City Care Clinic', priority: 'High', status: 'Open', time: '2h ago' },
        { id: 'TKT-2023', subject: 'Request for Pharmacy Module', tenant: 'Green Health', priority: 'Medium', status: 'In Progress', time: '5h ago' },
        { id: 'TKT-1998', subject: 'Billing Issue - Double Charge', tenant: 'MediMart', priority: 'Critical', status: 'Resolved', time: '1d ago' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Communication Center</h1>
                    <p className="text-slate-500 mt-1">Announcements and Support Tickets</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'announcements' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        Announcements
                    </button>
                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'tickets' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        Support Tickets
                    </button>
                </div>
            </div>

            {activeTab === 'announcements' ? (
                <div className="space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                                    {Icons.megaphone}
                                    Active Global Banner
                                </h3>
                                <p className="text-indigo-700 mt-2 text-sm">
                                    "Scheduled Maintenance: The system will be offline for 30 minutes on Sunday at 2 AM UTC."
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-white text-indigo-700 text-sm font-medium rounded border border-indigo-200">Edit</button>
                                <button className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700">Take Down</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                            {Icons.plus}
                        </div>
                        <h3 className="font-medium text-slate-900">Create New Announcement</h3>
                        <p className="text-sm text-slate-500 mt-1">Send push notifications or email blasts to tenants</p>
                        <button className="mt-4 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
                            Draft Message
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Ticket ID</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Subject</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Tenant</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Priority</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{ticket.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{ticket.subject}</td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{ticket.tenant}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${ticket.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                            ticket.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-50 text-blue-700'
                                            }`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ticket.status === 'Open' ? 'bg-emerald-100 text-emerald-700' :
                                            ticket.status === 'Resolved' ? 'bg-slate-100 text-slate-500' :
                                                'bg-blue-50 text-blue-700'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                        <div className="text-xs text-slate-400 mt-1">{ticket.time}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Reply</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Communication;
