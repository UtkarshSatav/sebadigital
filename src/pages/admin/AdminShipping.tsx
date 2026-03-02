import { useEffect, useState } from 'react';
import { Truck, MapPin, Clock, Package, CheckCircle2, ChevronDown } from 'lucide-react';
import { getOrders, updateOrderStatus, updateClickAndCollect, type Order } from '../../services/orderService';
import { toast } from 'sonner';

export function AdminShipping() {
    const [tab, setTab] = useState<'shipments' | 'collect'>('shipments');
    const [shipments, setShipments] = useState<Order[]>([]);
    const [collectOrders, setCollectOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [paidRes, allRes] = await Promise.all([
                getOrders({ status: 'paid' }),
                getOrders({ limitCount: 200 }),
            ]);
            setShipments(paidRes.orders.filter(o => o.deliveryMethod === 'shipping'));
            setCollectOrders(allRes.orders.filter(o =>
                o.deliveryMethod === 'click_and_collect' &&
                ['paid', 'packed'].includes(o.status)
            ));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const markDispatched = async (orderId: string) => {
        setActing(orderId);
        try {
            await updateOrderStatus(orderId, 'dispatched');
            await updateClickAndCollect(orderId, { status: 'pending_collection' });
            toast.success('Marked as dispatched');
            loadData();
        } catch (e: any) { toast.error('Failed', { description: e.message }); }
        finally { setActing(null); }
    };

    const markReadyForCollection = async (orderId: string) => {
        setActing(orderId);
        try {
            await updateOrderStatus(orderId, 'packed');
            await updateClickAndCollect(orderId, { status: 'ready_for_collection', readyAt: new Date() as any });
            toast.success('Marked ready for collection');
            loadData();
        } catch (e: any) { toast.error('Failed', { description: e.message }); }
        finally { setActing(null); }
    };

    const markCollected = async (orderId: string) => {
        setActing(orderId);
        try {
            await updateOrderStatus(orderId, 'delivered');
            await updateClickAndCollect(orderId, { status: 'collected', collectedAt: new Date() as any });
            toast.success('Marked as collected');
            loadData();
        } catch (e: any) { toast.error('Failed', { description: e.message }); }
        finally { setActing(null); }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Shipping Management</h1>
                <p className="text-gray-500 text-sm mt-1">Manage shipments, tracking, and click & collect</p>
            </div>

            {/* Config Cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3"><Truck className="w-5 h-5 text-blue-600" /></div>
                    <h3 className="font-semibold text-gray-900 mb-1">Standard Delivery</h3>
                    <p className="text-sm text-gray-500">3–5 working days</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">FREE <span className="text-xs text-gray-400 font-normal">over £50</span></p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center mb-3"><Clock className="w-5 h-5 text-orange-600" /></div>
                    <h3 className="font-semibold text-gray-900 mb-1">Next Day Delivery</h3>
                    <p className="text-sm text-gray-500">Order before 2pm</p>
                    <p className="text-lg font-bold text-orange-600 mt-2">£4.99</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center mb-3"><MapPin className="w-5 h-5 text-emerald-600" /></div>
                    <h3 className="font-semibold text-gray-900 mb-1">Click & Collect</h3>
                    <p className="text-sm text-gray-500">West Ealing, London</p>
                    <p className="text-lg font-bold text-emerald-600 mt-2">FREE</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
                {(['shipments', 'collect'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                        {t === 'shipments' ? `Pending Shipments (${shipments.length})` : `Click & Collect (${collectOrders.length})`}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : tab === 'shipments' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {shipments.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No pending shipments</p>
                            <p className="text-xs text-gray-400 mt-1">Paid shipping orders will appear here</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Order</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Customer</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Items</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Total</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Date</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Action</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {shipments.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 font-mono text-xs text-blue-600">{order.orderNumber}</td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                                            <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{order.lineItems?.length || 0} item(s)</td>
                                        <td className="px-5 py-4 font-semibold text-sm text-gray-900">£{order.pricing?.grandTotal?.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-xs text-gray-500">{order.createdAt?.toDate?.()?.toLocaleDateString('en-GB') || '—'}</td>
                                        <td className="px-5 py-4">
                                            <button onClick={() => markDispatched(order.id!)}
                                                disabled={acting === order.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium disabled:opacity-50">
                                                <Truck className="w-3 h-3" />
                                                {acting === order.id ? 'Updating...' : 'Mark Dispatched'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {collectOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No pending collections</p>
                            <p className="text-xs text-gray-400 mt-1">Click & Collect orders will appear here when paid</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Order</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Customer</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Total</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Collection Status</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Actions</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {collectOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 font-mono text-xs text-blue-600">{order.orderNumber}</td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                                            <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-sm">£{order.pricing?.grandTotal?.toFixed(2)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.clickAndCollect?.status === 'ready_for_collection' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {order.clickAndCollect?.status?.replace(/_/g, ' ') || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                {order.status === 'paid' && (
                                                    <button onClick={() => markReadyForCollection(order.id!)} disabled={acting === order.id}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg font-medium disabled:opacity-50">
                                                        {acting === order.id ? '...' : 'Mark Ready'}
                                                    </button>
                                                )}
                                                {order.status === 'packed' && (
                                                    <button onClick={() => markCollected(order.id!)} disabled={acting === order.id}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium disabled:opacity-50 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        {acting === order.id ? '...' : 'Collected'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
