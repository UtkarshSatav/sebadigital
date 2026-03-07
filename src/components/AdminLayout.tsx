import { Outlet, Link, useLocation } from 'react-router';
import { ScrollToTop } from './ScrollToTop';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Tag,
    Truck,
    RotateCcw,
    Film,
    FileText,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X,
    Monitor,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/promotions', label: 'Promotions', icon: Tag },
    { path: '/admin/shipping', label: 'Shipping', icon: Truck },
    { path: '/admin/returns', label: 'Returns', icon: RotateCcw },
    { path: '/admin/media-transfers', label: 'Media Transfers', icon: Film },
    { path: '/admin/cms', label: 'CMS Content', icon: FileText },
    { path: '/admin/page-editor', label: 'Page Editor', icon: Monitor },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
    const { adminProfile, signOutUser } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (path: string, exact?: boolean) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const handleSignOut = async () => {
        await signOutUser();
        window.location.href = '/admin/login';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <ScrollToTop />
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="px-6 py-5 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-lg font-bold text-white">Seba Digital</h1>
                                <p className="text-xs text-blue-300/60">Order Management</p>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden text-white/60 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path, item.exact);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {item.label}
                                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="px-3 py-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                                {adminProfile?.displayName?.charAt(0) || 'A'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {adminProfile?.displayName || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    {adminProfile?.email || ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 w-full transition-all mt-1"
                        >
                            <ChevronRight className="w-5 h-5" />
                            View Storefront
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-600 hover:text-gray-900"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="text-sm text-gray-500">
                        Welcome back, <span className="font-medium text-gray-900">{adminProfile?.displayName || 'Admin'}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
