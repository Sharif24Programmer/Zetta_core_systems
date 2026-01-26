import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllUsers } from '../hooks/useAdmin';
import Loader from '../../shared/components/Loader';

const UserList = () => {
    const navigate = useNavigate();
    const { users, loading } = useAllUsers();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/app/admin')}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="page-title">Users</h1>
                </div>
                <p className="text-sm text-slate-500 ml-11">{filteredUsers.length} users</p>
            </div>

            <div className="page-content">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                        className="input-field pl-10"
                    />
                    <svg
                        className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* User List */}
                {loading ? (
                    <Loader text="Loading users..." />
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        No users found
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="card">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                        <span className="text-white font-semibold">
                                            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 truncate">
                                            {user.name || 'Unnamed User'}
                                        </p>
                                        <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${user.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                                    user.role === 'super_admin' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            {user.role || 'user'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                                    <span>Provider: {user.provider || 'email'}</span>
                                    <span>Tenant: {user.tenantId ? user.tenantId.substring(0, 8) + '...' : 'None'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;
