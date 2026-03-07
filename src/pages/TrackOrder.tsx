import { useState } from 'react';
import {
    Search, Package, Truck, CheckCircle2, XCircle, Clock, MapPin,
    ExternalLink, AlertCircle, ArrowLeft, Store
} from 'lucide-react';
import { trackOrder, type OrderTrackingResult, STATUS_LABELS } from '../services/trackingService';
import { ScrollToTop } from '../components/ScrollToTop';

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

export function TrackOrder() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<OrderTrackingResult | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setLoading(true);
        setResult(null);
        const data = await trackOrder(input.trim());
        setResult(data);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <ScrollToTop />
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
                    <p className="text-gray-500">Enter your order number to see real-time delivery updates.</p>
                </div>

                {/* Search form */}
                <form onSubmit={handleTrack} className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Order Number</label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value.toUpperCase())}
                                placeholder="e.g. SEB-ABC123"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                            Track
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Your order number is in your confirmation email — it starts with SEB-</p>
                </form>

                {/* Error */}
                {result && !result.found && (
                    <div className="bg-white rounded-2xl border border-red-200 p-6 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Order Not Found</h3>
                            <p className="text-sm text-gray-500">{result.error}</p>
                        </div>
                    </div>
                )}

                {/* Result */}
                {result?.found && (
                    <div className="space-y-5">
                        {/* Status card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Order</p>
                                    <p className="text-xl font-bold text-gray-900 font-mono">{result.orderNumber}</p>
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

                            <div className="grid grid-cols-2 gap-4">
                                {result.trackingNumber && (
                                    <div className="bg-gray-50 rounded-xl p-4">
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
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> Delivery Address
                                        </p>
                                        <p className="text-sm text-gray-700">{result.shippingAddress.line1}</p>
                                        <p className="text-sm text-gray-700">{result.shippingAddress.city}, {result.shippingAddress.postcode}</p>
                                    </div>
                                )}
                                {result.deliveryMethod === 'click_and_collect' && !result.shippingAddress && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                                            <Store className="w-3 h-3" /> Collection Store
                                        </p>
                                        <p className="text-sm text-gray-700">Seba Digital</p>
                                        <p className="text-sm text-gray-500">West Ealing, London</p>
                                    </div>
                                )}
                            </div>

                            {/* Royal Mail not yet connected notice */}
                            {!result.trackingNumber && result.status === 'dispatched' && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                                    Royal Mail live tracking will appear here once the courier API is fully connected.
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-5">Tracking History</h3>
                            <div className="space-y-0">
                                {result.events.map((event, i) => (
                                    <div key={i} className="flex gap-4">
                                        {/* Timeline line */}
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${i === 0 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                            {i < result.events.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 my-1 min-h-6" />
                                            )}
                                        </div>
                                        {/* Event content */}
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

                        {/* Help */}
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-900">
                            <p className="font-semibold mb-1">Need help with your order?</p>
                            <p>Contact us at <a href="mailto:sebadigital@hotmail.co.uk" className="underline font-medium">sebadigital@hotmail.co.uk</a> quoting your order number.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
