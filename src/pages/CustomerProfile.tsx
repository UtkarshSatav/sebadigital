import { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router';
import {
    User, Package, MapPin, Settings, LogOut, ChevronRight,
    Edit2, CheckCircle2, Mail, Phone, Shield, Search,
    Truck, XCircle, Clock, ExternalLink, AlertCircle, Store, Home
} from 'lucide-react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { getCustomerOrders, STATUS_LABELS } from '../services/trackingService';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { trackOrder, type OrderTrackingResult } from '../services/trackingService';

// ─── Tabs definition ──────────────────────────────────────────────────────────

const TABS = [
    { label: 'My Orders', icon: Package, path: '/account/profile' },
    { label: 'Track Order', icon: Search, path: '/account/profile/track' },
    { label: 'Personal Info', icon: User, path: '/account/profile/info' },
    { label: 'Addresses', icon: MapPin, path: '/account/profile/addresses' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const colours: Record<string, string> = {
        delivered: 'bg-emerald-100 text-emerald-800',
        collected: 'bg-emerald-100 text-emerald-800',
        dispatched: 'bg-blue-100 text-blue-800',
        packed: 'bg-indigo-100 text-indigo-800',
        paid: 'bg-green-100 text-green-800',
        pending_payment: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-700',
        refunded: 'bg-gray-100 text-gray-700',
    };
    return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${colours[status] || 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[status] || status.replace(/_/g, ' ')}
        </span>
    );
}

// ─── Order Tab ────────────────────────────────────────────────────────────────

function OrdersTab({ customerId }: { customerId: string }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCustomerOrders(customerId)
            .then(setOrders)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [customerId]);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const handleReturn = async (orderId: string, orderNo: string) => {
        if (!confirm(`Are you sure you want to request a return for order ${orderNo}?`)) return;
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status: 'cancelled',
                updatedAt: new Date()
            });
            toast.success('Return requested. We will contact you with instructions.');
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
        } catch (e: any) {
            toast.error('Failed to request return', { description: e.message });
        }
    };

    if (orders.length === 0) return (
        <div className="text-center py-16">
            <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-500 text-sm mb-6">Your orders will appear here after you make a purchase.</p>
            <Link to="/products/tvs" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                Shop Now
            </Link>
        </div>
    );

    return (
        <div className="space-y-3">
            {orders.map(order => (
                <div key={order.id}
                    className="bg-gray-50 hover:bg-white rounded-xl border border-gray-200 hover:border-blue-200 p-4 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-bold text-blue-700">{order.orderNumber}</span>
                        <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{order.lineItems?.length || 0} item(s) · £{order.pricing?.grandTotal?.toFixed(2) || '—'}</span>
                        <span>{order.createdAt?.toDate?.()?.toLocaleDateString('en-GB') || '—'}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <Link to={`/account/profile/track?ref=${order.orderNumber}`}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            Track this order <ChevronRight className="w-3 h-3" />
                        </Link>
                        {order.status === 'delivered' && (
                            <button
                                onClick={() => handleReturn(order.id, order.orderNumber)}
                                className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline">
                                Request Return
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Track Order Tab ────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: string }) {
    const icons: Record<string, React.ReactNode> = {
        delivered: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
        collected: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
        cancelled: <XCircle className="w-6 h-6 text-red-500" />,
        refunded: <XCircle className="w-6 h-6 text-red-500" />,
        dispatched: <Truck className="w-6 h-6 text-blue-600" />,
        packed: <Package className="w-6 h-6 text-indigo-600" />,
    };
    return (icons[status] || <Clock className="w-6 h-6 text-yellow-500" />) as React.ReactNode;
}

function StatusColour(status: string) {
    const map: Record<string, string> = {
        delivered: 'bg-emerald-100 text-emerald-800',
        collected: 'bg-emerald-100 text-emerald-800',
        dispatched: 'bg-blue-100 text-blue-800',
        packed: 'bg-indigo-100 text-indigo-800',
        paid: 'bg-green-100 text-green-800',
        pending_payment: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800',
        refunded: 'bg-gray-100 text-gray-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
}

function TrackOrderTab({ customerId }: { customerId: string }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrderNo, setSelectedOrderNo] = useState<string>('');
    const [result, setResult] = useState<OrderTrackingResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [trackingLoading, setTrackingLoading] = useState(false);

    useEffect(() => {
        getCustomerOrders(customerId)
            .then((list) => {
                setOrders(list);
                if (list.length > 0) {
                    setSelectedOrderNo(list[0].orderNumber);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [customerId]);

    useEffect(() => {
        if (!selectedOrderNo) return;
        setTrackingLoading(true);
        setResult(null);
        trackOrder(selectedOrderNo).then(data => {
            setResult(data);
            setTrackingLoading(false);
        });
    }, [selectedOrderNo]);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (orders.length === 0) return (
        <div className="text-center py-16">
            <Search className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No active orders to track</h3>
            <p className="text-gray-500 text-sm">When you place an order, you can track its delivery status here.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Track Your Order</h3>
                <select
                    value={selectedOrderNo}
                    onChange={e => setSelectedOrderNo(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    {orders.map(o => (
                        <option key={o.id} value={o.orderNumber}>{o.orderNumber} ({o.createdAt?.toDate?.()?.toLocaleDateString('en-GB') || ''})</option>
                    ))}
                </select>
            </div>

            {trackingLoading && (
                <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {!trackingLoading && result?.found && (
                <div className="space-y-5">
                    {/* Status card */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Order</p>
                                <p className="text-lg font-bold text-gray-900 font-mono">{result.orderNumber}</p>
                            </div>
                            <StatusIcon status={result.status!} />
                        </div>

                        <div className="flex items-center gap-3 mb-5">
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${StatusColour(result.status!)}`}>
                                {STATUS_LABELS[result.status!] || result.status}
                            </span>
                            <span className="text-sm text-gray-400 capitalize">
                                {result.deliveryMethod === 'click_and_collect' ? 'Click & Collect' : 'Home Delivery'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {result.trackingNumber && (
                                <div className="bg-white border text-gray-700 border-gray-200 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 font-medium mb-1">Tracking Number</p>
                                    <p className="font-mono text-sm font-semibold text-gray-800">{result.trackingNumber}</p>
                                    {result.trackingUrl && (
                                        <a href={result.trackingUrl} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                                            Track on Royal Mail <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            )}
                            {result.shippingAddress && (
                                <div className="bg-white border text-gray-700 border-gray-200 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Delivery Address
                                    </p>
                                    <p className="text-sm text-gray-700">{result.shippingAddress.line1}</p>
                                    <p className="text-sm text-gray-700">{result.shippingAddress.city}, {result.shippingAddress.postcode}</p>
                                </div>
                            )}
                            {result.deliveryMethod === 'click_and_collect' && !result.shippingAddress && (
                                <div className="bg-white border text-gray-700 border-gray-200 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                                        <Store className="w-3 h-3" /> Collection Store
                                    </p>
                                    <p className="text-sm text-gray-700">Seba Digital</p>
                                    <p className="text-sm text-gray-500">West Ealing, London</p>
                                </div>
                            )}
                        </div>

                        {!result.trackingNumber && result.status === 'dispatched' && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                                Royal Mail live tracking will appear here once the courier API is fully connected.
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 px-1">Tracking History</h3>
                        <div className="space-y-0 px-2">
                            {result.events.map((event, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${i === 0 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                        {i < result.events.length - 1 && (
                                            <div className="w-0.5 h-full bg-gray-200 my-1 min-h-6" />
                                        )}
                                    </div>
                                    <div className={`pb-5 flex-1 ${i === result.events.length - 1 ? 'pb-0' : ''}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className={`text-sm font-semibold ${i === 0 ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    {event.title}
                                                </p>
                                                {event.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                                                )}
                                                {event.source === 'royal_mail' && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1">
                                                        <Truck className="w-3 h-3" /> Royal Mail
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                                {new Date(event.datetime).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Personal Info Tab ────────────────────────────────────────────────────────

function PersonalInfoTab() {
    const { customer, user } = useCustomerAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        firstName: customer?.firstName || '',
        lastName: customer?.lastName || '',
        phone: customer?.phone || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'customers', user.uid), {
                firstName: form.firstName,
                lastName: form.lastName,
                phone: form.phone,
            });
            toast.success('Profile updated');
            setEditing(false);
        } catch (e: any) {
            toast.error('Failed to save', { description: e.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Personal Information</h3>
                    <button onClick={() => setEditing(!editing)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500">
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
                {editing ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">First Name</label>
                                <input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Last Name</label>
                                <input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Phone</label>
                            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button onClick={handleSave} disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-200">
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{customer?.firstName} {customer?.lastName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{customer?.email || user?.email}</span>
                            {customer?.isVerified && (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                </span>
                            )}
                        </div>
                        {customer?.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{customer.phone}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Account security */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" /> Account Security
                </h3>
                <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Password</p>
                        <p className="text-xs text-gray-400">Last changed: unknown</p>
                    </div>
                    <button className="text-xs text-blue-600 hover:underline">Change</button>
                </div>
            </div>
        </div>
    );
}

// ─── Addresses Tab ────────────────────────────────────────────────────────────

function AddressesTab() {
    const { customer } = useCustomerAuth();
    const addr = customer?.shippingAddress;
    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-4">Saved Addresses</h3>
            {addr?.line1 ? (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wide">Default Shipping</p>
                            <p className="text-sm text-gray-700">{addr.line1}</p>
                            {addr.line2 && <p className="text-sm text-gray-700">{addr.line2}</p>}
                            <p className="text-sm text-gray-700">{addr.city}</p>
                            <p className="text-sm text-gray-700">{addr.postcode}</p>
                        </div>
                        <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500"><Edit2 className="w-4 h-4" /></button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm">No saved addresses yet. They'll be saved automatically when you place an order.</p>
                </div>
            )}
        </div>
    );
}

// ─── Profile Layout (parent of tabs) ─────────────────────────────────────────

export function CustomerProfile() {
    const { customer, user, signOut, isLoading } = useCustomerAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/account');
    };

    if (isLoading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) {
        navigate('/account');
        return null;
    }

    const activeTab = location.pathname;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Avatar card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
                                    {customer?.firstName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                                </div>
                                <p className="font-semibold text-gray-900">{customer?.firstName} {customer?.lastName}</p>
                                <p className="text-xs text-gray-400 mt-0.5 truncate w-full">{user.email}</p>
                                {customer?.isVerified && (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
                                        <CheckCircle2 className="w-3 h-3" /> Verified account
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Nav */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <Link to="/"
                                className="flex items-center gap-3 px-4 py-3 text-sm border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors">
                                <Home className="w-4 h-4 flex-shrink-0" />
                                Back to Homepage
                            </Link>
                            {TABS.map(tab => (
                                <Link key={tab.path} to={tab.path}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm border-b border-gray-100 last:border-0 transition-colors ${activeTab === tab.path ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                    <tab.icon className="w-4 h-4 flex-shrink-0" />
                                    {tab.label}
                                </Link>
                            ))}
                            <button onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            {/* Render sub-page content based on nested route */}
                            {activeTab === '/account/profile' && <OrdersTab customerId={user.uid} />}
                            {activeTab === '/account/profile/track' && <TrackOrderTab customerId={user.uid} />}
                            {activeTab === '/account/profile/info' && <PersonalInfoTab />}
                            {activeTab === '/account/profile/addresses' && <AddressesTab />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
