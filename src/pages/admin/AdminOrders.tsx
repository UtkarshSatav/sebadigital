import { useEffect, useState } from 'react';
import { ShoppingCart, Search, Eye, Clock, ChevronDown, Package, X } from 'lucide-react';
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
    shipping?: { trackingNumber?: string };
    shippingAddress?: any;
    createdAt: any;
}

function RMModal({
    order,
    onClose,
    onGenerate
}: {
    order: Order,
    onClose: () => void,
    onGenerate: (weight: number, service: string) => Promise<void>
}) {
    const [weight, setWeight] = useState(500);
    const [service, setService] = useState('T24');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onGenerate(weight, service);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 border-b-2 border-red-600 inline-block pb-1">
                            Royal Mail Click & Drop
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Configure shipment for {order.orderNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Package Weight (grams)
                        </label>
                        <input
                            type="number"
                            required
                            min={1}
                            max={30000} // RM generally caps out around 30kg for parcels
                            value={weight}
                            onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Type
                        </label>
                        <select
                            value={service}
                            onChange={(e) => setService(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white"
                        >
                            <option value="T24">Tracked 24</option>
                            <option value="T48">Tracked 48</option>
                            <option value="SD1">Special Delivery Guaranteed by 1pm</option>
                            <option value="1ST">1st Class</option>
                            <option value="2ND">2nd Class</option>
                        </select>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-600">
                        <p className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Package className="w-4 h-4 text-red-600" />
                            Shipping To:
                        </p>
                        <p>{order.shippingAddress?.name || order.customerName}</p>
                        <p>{order.shippingAddress?.addressLine1}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.postcode}</p>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : null}
                            Generate Label
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [openStatusMenu, setOpenStatusMenu] = useState<string | null>(null);
    const [activeRMModal, setActiveRMModal] = useState<Order | null>(null);

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

    const generateRoyalMailLabel = async (order: Order, weightGrams: number, service: string) => {
        if (!order.shippingAddress) {
            toast.error('No shipping address found for this order');
            return;
        }

        try {
            const baseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL || 'http://127.0.0.1:5001/seba-digital-oms/us-central1';
            const response = await fetch(`${baseUrl}/createRoyalMailShipment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    serviceType: service,
                    packageWeightGrams: weightGrams,
                    recipient: {
                        name: order.customerName,
                        email: order.customerEmail,
                        phone: order.shippingAddress.phone || '00000000000',
                        addressLine1: order.shippingAddress.addressLine1,
                        addressLine2: order.shippingAddress.addressLine2,
                        city: order.shippingAddress.city,
                        county: order.shippingAddress.county,
                        postcode: order.shippingAddress.postcode,
                        countryCode: 'GB'
                    }
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to generate shipment');
            }

            toast.success(data.simulated
                ? `Simulated Tracking Created: ${data.trackingNumber}`
                : `Shipment Created: ${data.trackingNumber}`);

            loadOrders();
        } catch (err: any) {
            console.error('RM Integration Error:', err);
            toast.error('Royal Mail API Error', { description: err.message });
            throw err; // re-throw so modal stays open on error
        }
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
            {activeRMModal && (
                <RMModal
                    order={activeRMModal}
                    onClose={() => setActiveRMModal(null)}
                    onGenerate={(weight, service) => generateRoyalMailLabel(activeRMModal, weight, service)}
                />
            )}

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
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Cost/Items</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Delivery</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Tracking / Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-blue-600">{order.orderNumber}</span>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {order.createdAt?.toDate?.()
                                                ? order.createdAt.toDate().toLocaleDateString('en-GB')
                                                : '—'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                                            <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">£{order.pricing?.grandTotal?.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">{order.lineItems?.length || 0} items</div>
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
                                        <div className="flex items-center gap-3">
                                            {order.deliveryMethod !== 'click_and_collect' && (
                                                order.shipping?.trackingNumber ? (
                                                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 flex items-center gap-1.5" title="Tracking Number">
                                                        <Package className="w-3 h-3" />
                                                        {order.shipping.trackingNumber}
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => setActiveRMModal(order)}
                                                        className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-sm"
                                                    >
                                                        <Package className="w-3.5 h-3.5" />
                                                        Create RM Label
                                                    </button>
                                                )
                                            )}
                                            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 ml-auto" title="View Order Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
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
