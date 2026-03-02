import { useEffect, useState } from 'react';
import { ShoppingCart, Search, Eye, Clock, ChevronDown } from 'lucide-react';
import { getOrders, updateOrderStatus, type OrderStatus } from '../../services/orderService';
import { toast } from 'sonner';

interface Order {
    id?: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: string;
    deliveryMethod: string;
    pricing: { grandTotal: number; subtotalIncVat: number; shippingFee: number };
    lineItems: any[];
    createdAt: any;
}

export function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [openStatusMenu, setOpenStatusMenu] = useState<string | null>(null);

    const ALL_STATUSES: OrderStatus[] = ['pending_payment', 'paid', 'packed', 'dispatched', 'delivered', 'cancelled', 'refunded'];

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const result = await getOrders({ limitCount: 100 });
            setOrders(result.orders as any);
        } catch (err) {
            console.error('Failed to load orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const changeStatus = async (orderId: string, status: OrderStatus) => {
        setUpdatingStatus(orderId);
        setOpenStatusMenu(null);
        try {
            await updateOrderStatus(orderId, status);
            toast.success(`Order status → ${status.replace(/_/g, ' ')}`);
            loadOrders();
        } catch (e: any) { toast.error('Failed', { description: e.message }); }
        finally { setUpdatingStatus(null); }
    };

    const statuses = ['all', 'pending_payment', 'paid', 'packed', 'dispatched', 'delivered', 'cancelled'];

    const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {statuses.map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Order</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Customer</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Items</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Total</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Delivery</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Date</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-blue-600">{order.orderNumber}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                                            <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{order.lineItems?.length || 0} items</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-gray-900">£{order.pricing?.grandTotal?.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${order.deliveryMethod === 'click_and_collect'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.deliveryMethod === 'click_and_collect' ? 'Collect' : 'Shipping'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenStatusMenu(openStatusMenu === order.id ? null : order.id!)}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}
                                            >
                                                {updatingStatus === order.id ? '...' : order.status?.replace(/_/g, ' ')}
                                                <ChevronDown className="w-3 h-3" />
                                            </button>
                                            {openStatusMenu === order.id && (
                                                <div className="absolute left-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-44">
                                                    {ALL_STATUSES.map(s => (
                                                        <button key={s} onClick={() => changeStatus(order.id!, s)}
                                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${s === order.status ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                                                            {s.replace(/_/g, ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-500">
                                            {order.createdAt?.toDate?.()
                                                ? order.createdAt.toDate().toLocaleDateString('en-GB')
                                                : '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600" title="View">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="p-12 text-center">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No orders {statusFilter !== 'all' ? `with status "${statusFilter.replace(/_/g, ' ')}"` : 'yet'}</p>
                        <p className="text-gray-400 text-xs mt-1">Orders will appear here once customers start purchasing</p>
                    </div>
                )}
            </div>
        </div>
    );
}
