/**
 * Order Tracking Service
 *
 * Aggregates tracking info from two sources:
 *  1. Firestore — our order record (always available)
 *  2. Royal Mail Click & Drop — live courier events (available once VITE_FUNCTIONS_BASE_URL is set)
 *
 * When the Royal Mail API key is not yet configured, the service returns
 * placeholder events so the UI still renders correctly.
 */

import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getRoyalMailTracking, getRoyalMailTrackingUrl } from './royalMailService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrackingEventSource = 'store' | 'royal_mail';

export interface TrackingEvent {
    datetime: string;
    title: string;
    description: string;
    source: TrackingEventSource;
}

export interface OrderTrackingResult {
    found: boolean;
    orderNumber?: string;
    status?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    deliveryMethod?: string;
    estimatedDelivery?: string;
    shippingAddress?: {
        line1: string;
        city: string;
        postcode: string;
    } | null;
    events: TrackingEvent[];
    error?: string;
}

// ─── Status → readable label ─────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
    pending_payment: 'Awaiting Payment',
    paid: 'Order Confirmed',
    packed: 'Packed & Ready',
    dispatched: 'Dispatched',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    pending_collection: 'Ready for Collection',
    collected: 'Collected',
};

/** Convert Firestore order status into a human-readable milestone event */
function orderStatusToEvent(status: string, updatedAt: any): TrackingEvent {
    const dt = updatedAt?.toDate?.()?.toISOString() || new Date().toISOString();
    return {
        datetime: dt,
        title: STATUS_LABELS[status] || status,
        description: getStatusDescription(status),
        source: 'store',
    };
}

function getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
        pending_payment: 'Your order is awaiting payment confirmation.',
        paid: 'Payment received — your order is being prepared.',
        packed: 'Your items have been packed and are ready to ship.',
        dispatched: 'Your order has been collected by Royal Mail.',
        delivered: 'Your order has been delivered.',
        cancelled: 'This order was cancelled.',
        refunded: 'A refund has been issued to your original payment method.',
        pending_collection: 'Your order is ready to collect at our store.',
        collected: 'Order collected — thank you!',
    };
    return descriptions[status] || '';
}

// ─── Main tracking function ───────────────────────────────────────────────────

/**
 * Look up an order by order number (e.g. SEB-ABC123) and return
 * combined Firestore + Royal Mail tracking data.
 */
export async function trackOrder(orderNumber: string): Promise<OrderTrackingResult> {
    try {
        // Search Firestore by orderNumber field
        const q = query(
            collection(db, 'orders'),
            where('orderNumber', '==', orderNumber.trim().toUpperCase())
        );
        const snap = await getDocs(q);

        if (snap.empty) {
            return { found: false, events: [], error: 'Order not found. Check your order number and try again.' };
        }

        const d = snap.docs[0];
        const order = d.data() as any;

        // Build base store events
        const events: TrackingEvent[] = [
            {
                datetime: order.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                title: 'Order Placed',
                description: 'Your order was successfully placed on sebadigital.co.uk.',
                source: 'store',
            },
            orderStatusToEvent(order.status, order.updatedAt || order.createdAt),
        ];

        // Get Royal Mail tracking if a tracking number exists
        const trackingNumber = order.shipping?.trackingNumber || null;
        let trackingUrl: string | undefined;

        if (trackingNumber) {
            trackingUrl = getRoyalMailTrackingUrl(trackingNumber);

            try {
                const rmData = await getRoyalMailTracking(trackingNumber);
                if (rmData?.events?.length) {
                    rmData.events.forEach((e: any) => {
                        events.push({
                            datetime: e.datetime,
                            title: e.description,
                            description: e.location || '',
                            source: 'royal_mail',
                        });
                    });
                }
            } catch {
                // Royal Mail API not available yet — that's fine, store events still show
            }
        }

        // Sort all events newest-first
        events.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

        return {
            found: true,
            orderNumber: order.orderNumber,
            status: order.status,
            trackingNumber: trackingNumber || undefined,
            trackingUrl,
            deliveryMethod: order.deliveryMethod,
            shippingAddress: order.shippingAddress
                ? {
                    line1: order.shippingAddress.line1,
                    city: order.shippingAddress.city,
                    postcode: order.shippingAddress.postcode,
                }
                : null,
            events,
        };
    } catch (err: any) {
        return { found: false, events: [], error: err.message || 'Failed to load tracking information.' };
    }
}

/**
 * Get all orders for a logged-in customer.
 */
export async function getCustomerOrders(customerId: string) {
    const q = query(
        collection(db, 'orders'),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
}

export { STATUS_LABELS };
