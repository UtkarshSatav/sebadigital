import { useEffect, useState } from 'react';
import { RotateCcw, Clock, CheckCircle, Package, ArrowRight } from 'lucide-react';
import { getOrders, updateOrderStatus, type Order } from '../../services/orderService';
import { toast } from 'sonner';

type ReturnStatus = 'cancelled' | 'refunded';

export function AdminReturns() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [cancelledRes, refundedRes] = await Promise.all([
                getOrders({ status: 'cancelled' }),
                getOrders({ status: 'refunded' }),
            ]);
            setOrders([...cancelledRes.orders, ...refundedRes.orders]);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const advance = async (orderId: string, toStatus: 'cancelled' | 'refunded') => {
        setActing(orderId);
        try {
            await updateOrderStatus(orderId, toStatus);
            toast.success(`Order marked as ${toStatus}`);
            loadData();
        } catch (e: any) { toast.error('Failed', { description: e.message }); }
        finally { setActing(null); }
    };

    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    const refundedOrders = orders.filter(o => o.status === 'refunded');

    const statCards = [
        { label: 'Requested', count: cancelledOrders.length, color: 'yellow', Icon: Clock },
        { label: 'Refunded', count: refundedOrders.length, color: 'emerald', Icon: RotateCcw },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Returns & Refunds</h1>
                <p className="text-gray-500 text-sm mt-1">Manage return requests and process refunds</p>
            </div>

            {/* Stat Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {statCards.map(({ label, count, color, Icon }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 bg-${color}-50 rounded-lg flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 text-${color}-600`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                            <p className="text-xs text-gray-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Return Requests Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Return Requests & Refunds</h2>
                    <p className="text-xs text-gray-400">Return lifecycle: Cancelled → Refunded</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Return Requests</h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                            Cancelled & refunded orders will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Order</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Customer</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Total</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Date</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Action</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 font-mono text-xs text-blue-600">{order.orderNumber}</td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                                            <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-sm">£{order.pricing?.grandTotal?.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-xs text-gray-500">
                                            {order.createdAt?.toDate?.()?.toLocaleDateString('en-GB') || '—'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'refunded' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {order.status === 'cancelled' && (
                                                <button onClick={() => advance(order.id!, 'refunded')}
                                                    disabled={acting === order.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg font-medium disabled:opacity-50">
                                                    <ArrowRight className="w-3 h-3" />
                                                    {acting === order.id ? '...' : 'Mark Refunded'}
                                                </button>
                                            )}
                                            {order.status === 'refunded' && (
                                                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Refunded
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
