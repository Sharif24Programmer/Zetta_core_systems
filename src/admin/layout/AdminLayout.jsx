import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { AdminIcons as Icons } from '../components/AdminIcons';

const AdminLayout = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: Icons.dashboard },
        { path: '/admin/tenants', label: 'Tenants', icon: Icons.tenants },
        { path: '/admin/modules', label: 'Modules', icon: Icons.modules },
        { path: '/admin/master-data', label: 'Master Data', icon: Icons.database },
        { path: '/admin/tickets', label: 'Support Tickets', icon: Icons.help },
        { path: '/admin/communication', label: 'Communication', icon: Icons.megaphone },
        { path: '/admin/payments', label: 'Payments', icon: Icons.payments },
        { path: '/admin/revenue', label: 'Revenue', icon: Icons.revenue },
        { path: '/admin/users', label: 'Users', icon: Icons.users },
        { path: '/admin/settings', label: 'Settings', icon: Icons.settings },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile Header / Toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex items-center justify-between z-40 shadow-md">
                <span className="font-bold text-lg">Zetta Admin</span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
                    {isSidebarOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    )}
                </button>
            </div>

            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-40 transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-tight">Zetta Admin</h1>
                    <p className="text-xs text-slate-400 mt-1">Super Admin Panel</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)} // Close on navigate (mobile)
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            SA
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Super Admin</p>
                            <p className="text-xs text-slate-400">admin@zetta.com</p>
                        </div>
                        <Link to="/setup" className="text-slate-400 hover:text-white" title="Go to App">
                            {Icons.logout}
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
