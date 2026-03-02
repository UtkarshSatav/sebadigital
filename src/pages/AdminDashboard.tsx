import { useEffect, useState } from 'react';
import {
    Package,
    ShoppingCart,
    Truck,
    RotateCcw,
    Film,
    Users,
    TrendingUp,
    Clock,
    MapPin,
} from 'lucide-react';
import { getDashboardOverview, type DashboardOverview } from '../services/dashboardService';

export function AdminDashboard() {
    const [data, setData] = useState<DashboardOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const overview = await getDashboardOverview();
            setData(overview);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 text-sm">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600 mb-3">{error}</p>
                <button onClick={loadDashboard} className="text-sm text-blue-600 hover:underline">
                    Try again
                </button>
            </div>
        );
    }

    const stats = [
        {
            label: "Today's Orders",
            value: data?.todaysOrders || 0,
            icon: ShoppingCart,
            color: 'blue',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            label: "Today's Revenue",
            value: `£${(data?.todaysRevenue || 0).toFixed(2)}`,
            icon: TrendingUp,
            color: 'green',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
        },
        {
            label: 'Pending Shipments',
            value: data?.pendingShipments || 0,
            icon: Truck,
            color: 'orange',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
        },
        {
            label: 'Returns in Progress',
            value: data?.returnsInProgress || 0,
            icon: RotateCcw,
            color: 'red',
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600',
        },
        {
            label: 'Pending Collections',
            value: data?.pendingCollections || 0,
            icon: MapPin,
            color: 'purple',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
        },
        {
            label: 'Active Media Jobs',
            value: data?.activeMediaJobs || 0,
            icon: Film,
            color: 'indigo',
            bgColor: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
        {
            label: 'Total Customers',
            value: data?.totalCustomers || 0,
            icon: Users,
            color: 'teal',
            bgColor: 'bg-teal-50',
            iconColor: 'text-teal-600',
        },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending_payment: 'bg-yellow-100 text-yellow-700',
            paid: 'bg-green-100 text-green-700',
            packed: 'bg-blue-100 text-blue-700',
            dispatched: 'bg-indigo-100 text-indigo-700',
            delivered: 'bg-emerald-100 text-emerald-700',
            cancelled: 'bg-red-100 text-red-700',
            refunded: 'bg-gray-100 text-gray-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Overview of your store's performance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                    <a href="/admin/orders" className="text-sm text-blue-600 hover:underline">
                        View all →
                    </a>
                </div>

                {data?.recentOrders && data.recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                        Order
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                        Customer
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                        Total
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                        Status
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-blue-600">{order.orderNumber}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{order.customerName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-gray-900">£{order.grandTotal.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">
                                                {order.createdAt?.toDate?.()
                                                    ? order.createdAt.toDate().toLocaleDateString('en-GB')
                                                    : '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No orders yet</p>
                        <p className="text-gray-400 text-xs mt-1">Orders will appear here once customers start purchasing</p>
                    </div>
                )}
            </div>
        </div>
    );
}
