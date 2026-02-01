import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AdminIcons as Icons } from '../components/AdminIcons';
import PlanSelector from '../components/PlanSelector';
import { toast } from 'react-hot-toast';
import { mailService } from '../../services/mailService';
import { ListSkeleton } from '../../shared/components/Skeleton';

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'admins' | 'all'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Approval Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPlanId, setSelectedPlanId] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let q;
            const usersRef = collection(db, 'users');

            if (activeTab === 'pending') {
                q = query(usersRef, where('subscriptionStatus', '==', 'pending'));
            } else if (activeTab === 'admins') {
                q = query(usersRef, where('role', 'in', ['admin', 'super_admin']));
            } else {
                q = query(usersRef); // Fetch all (limit this in production)
            }

            const snapshot = await getDocs(q);
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const initiateApproval = (user) => {
        setSelectedUser(user);
        setSelectedPlanId(user.planId || 'basic');
    };

    const confirmApproval = async () => {
        if (!selectedUser) return;

        setActionLoading(selectedUser.id);
        try {
            // 1. Activate User
            await updateDoc(doc(db, 'users', selectedUser.id), {
                subscriptionStatus: 'active',
                planId: selectedPlanId,
                role: 'admin', // Default new tenant admin
                subscriptionStartDate: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // 2. Activate Tenant
            if (selectedUser.tenantId) {
                await updateDoc(doc(db, 'tenants', selectedUser.tenantId), {
                    status: 'active',
                    planId: selectedPlanId,
                    updatedAt: serverTimestamp()
                });
            }

            // 3. Send Email
            await mailService.sendApprovalEmail(selectedUser.email, selectedUser.name || 'User', selectedPlanId);

            // 4. Update UI
            setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
            toast.success(`Approved ${selectedUser.name} on ${selectedPlanId} plan`);
            setSelectedUser(null);
        } catch (err) {
            console.error(err);
            toast.error('Approval failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId) => {
        if (!confirm('Reject this user?')) return;
        setActionLoading(userId);
        try {
            await updateDoc(doc(db, 'users', userId), {
                subscriptionStatus: 'rejected',
                updatedAt: serverTimestamp()
            });

            // Send Rejection Email (Optional: Need user object, might need to find it first)
            const user = users.find(u => u.id === userId);
            if (user) {
                await mailService.sendRejectionEmail(user.email, user.name);
            }

            setUsers(prev => prev.filter(u => u.id !== userId));
            toast.success('User rejected');
        } catch (err) {
            console.error(err);
            toast.error('Rejection failed');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage system administrators and user approvals</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        {Icons.plus}
                        Invite Admin
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'pending'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Pending Approvals ({activeTab === 'pending' ? users.length : '?'})
                </button>
                <button
                    onClick={() => setActiveTab('admins')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'admins'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    System Admins
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'all'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    All Users
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <ListSkeleton rows={5} />
            ) : users.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-lg">No users found in this category.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Joined</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-semibold text-slate-600 uppercase">
                                                    {(user.name || user.email)?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{user.name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                                                {user.role || 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1 capitalize ${user.subscriptionStatus === 'active' ? 'bg-emerald-50 text-emerald-700' :
                                                    user.subscriptionStatus === 'pending' ? 'bg-amber-50 text-amber-700' :
                                                        'bg-red-50 text-red-700'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.subscriptionStatus === 'active' ? 'bg-emerald-500' :
                                                        user.subscriptionStatus === 'pending' ? 'bg-amber-500' :
                                                            'bg-red-500'
                                                    }`}></span>
                                                {user.subscriptionStatus || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {activeTab === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleReject(user.id)}
                                                        className="text-red-600 hover:text-red-700 text-sm font-medium px-2"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => initiateApproval(user)}
                                                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium px-2"
                                                    >
                                                        Approve
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-4">Approve Access for {selectedUser.name}</h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Assign Subscription Plan</label>
                            <PlanSelector
                                selectedPlanId={selectedPlanId}
                                onSelect={setSelectedPlanId}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApproval}
                                disabled={actionLoading === selectedUser.id}
                                className="btn-primary"
                            >
                                {actionLoading === selectedUser.id ? 'Activating...' : 'Confirm & Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
