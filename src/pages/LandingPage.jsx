import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                                Z
                            </div>
                            <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                Zetta POS
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
                            <a href="#solutions" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Solutions</a>
                            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
                            {user ? (
                                <Link
                                    to="/app"
                                    className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to="/login" className="text-sm font-semibold text-slate-900 hover:text-indigo-600 px-4 py-2">
                                        Log in
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="px-6 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30"
                                    >
                                        Start Free Trial
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-40 pointer-events-none">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-8 animate-fadeIn">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        New: Multi-Location Support & SMS Features
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
                        The Operating System for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Modern Healthcare Retail</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
                        Manage inventory, billing, patients, and analytics in one beautiful platform.
                        Designed for pharmacies, clinics, and hospital chains.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slideUp">
                        <Link
                            to="/login"
                            className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 hover:-translate-y-1"
                        >
                            Get Started Free
                        </Link>
                        <a
                            href="#demo"
                            className="px-8 py-4 rounded-xl bg-white text-slate-700 border border-slate-200 font-bold text-lg hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Watch Demo
                        </a>
                    </div>
                </div>

                {/* Dashboard Preview Mockup */}
                <div className="mt-20 relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-2xl bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-900/10">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-slate-900/50 to-transparent z-10 rounded-2xl pointer-events-none"></div>
                        <div className="bg-slate-800 rounded-xl overflow-hidden aspect-[16/9] relative group cursor-default">
                            {/* Create a CSS-only dashboard skeleton representation for "Amazing Detail" without actual image dependency */}
                            <div className="absolute inset-0 bg-slate-50 flex">
                                {/* Sidebar */}
                                <div className="w-64 bg-slate-900 h-full border-r border-slate-800 p-4 hidden md:flex flex-col gap-4">
                                    <div className="h-8 w-8 bg-indigo-500 rounded-lg"></div>
                                    <div className="space-y-2 mt-8">
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 w-full bg-slate-800 rounded-lg"></div>)}
                                    </div>
                                </div>
                                {/* Main */}
                                <div className="flex-1 p-8 bg-slate-50 overflow-hidden">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
                                        <div className="h-10 w-32 bg-indigo-600 rounded-lg"></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6 mb-8">
                                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-xl shadow-sm border border-slate-100"></div>)}
                                    </div>
                                    <div className="h-64 bg-white rounded-xl shadow-sm border border-slate-100 mb-6"></div>
                                </div>
                            </div>
                            {/* Overlay Text */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/5 transition-colors">
                                <span className="sr-only">Dashboard Preview</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            Everything you need to run your healthcare business
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Smart POS",
                                desc: "Lightning fast billing with barcode scanning, auto-stock updates, and thermal printing support.",
                                icon: (
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                ),
                                color: "bg-blue-500"
                            },
                            {
                                title: "Inventory Management",
                                desc: "Real-time tracking of medicine expiry, low stock alerts, and automated reorder suggestions.",
                                icon: (
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                ),
                                color: "bg-purple-500"
                            },
                            {
                                title: "Patient Records (EMR)",
                                desc: "Securely store patient history, prescriptions, and lab reports. Compliance ready.",
                                icon: (
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                ),
                                color: "bg-emerald-500"
                            },
                            {
                                title: "Analytics & Reports",
                                desc: "Deep insights into your best selling products, peak hours, and revenue growth.",
                                icon: (
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                ),
                                color: "bg-orange-500"
                            },
                            {
                                title: "Multi-Location",
                                desc: "Manage multiple clinics or pharmacy branches from a single super-admin dashboard.",
                                icon: (
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                ),
                                color: "bg-indigo-500"
                            },
                            {
                                title: "SMS & Notifications",
                                desc: "Automated appointment reminders and bill details sent directly to patient phones.",
                                icon: (
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                ),
                                color: "bg-pink-500"
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="group relative bg-slate-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100">
                                <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                    {/* Decorative large icon background */}
                                    <div className={`w-24 h-24 rounded-full ${feature.color}`}></div>
                                </div>
                                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-slate-900 py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>
                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                        Ready to modernize your medical practice?
                    </h2>
                    <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                        Join 500+ clinics and pharmacies trusting Zetta POS for their daily operations.
                        Start your 14-day free trial today.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block px-10 py-5 rounded-xl bg-white text-slate-900 font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:scale-105"
                    >
                        Sign Up Now - It's Free
                    </Link>
                    <p className="mt-6 text-sm text-slate-400">No credit card required for trial.</p>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    Z
                                </div>
                                <span className="font-bold text-xl text-slate-900">Zetta POS</span>
                            </div>
                            <p className="text-sm text-slate-500">
                                Advanced Medical POS & Practice Management Software.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li><a href="#" className="hover:text-indigo-600">Features</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Pricing</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Showcase</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Roadmap</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li><a href="#" className="hover:text-indigo-600">About Us</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Careers</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Blog</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-8 text-center text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} Zetta Systems. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
