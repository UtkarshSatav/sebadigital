import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────
export interface ShippingAddress {
    line1: string;
    line2: string;
    city: string;
    county: string;
    postcode: string;
    country: string;
}

export interface ShippingConfig {
    freeShippingThreshold: number;
    standardShippingFee: number;
    supportedRegions: string[];
}

export interface ClickAndCollectConfig {
    enabled: boolean;
    storeName: string;
    storeAddress: string;
    operatingHours: Record<string, string>;
}

// ─── Shipping Fee Logic ──────────────────────────────────────────────

/** Calculate shipping fee based on order subtotal */
export function calculateShippingFee(
    subtotalIncVat: number,
    freeThreshold: number = 50,
    standardFee: number = 4.99
): number {
    return subtotalIncVat >= freeThreshold ? 0 : standardFee;
}

/** Get shipping config from global settings */
export async function getShippingConfig(): Promise<ShippingConfig> {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    if (!snap.exists()) {
        return {
            freeShippingThreshold: 50,
            standardShippingFee: 4.99,
            supportedRegions: ['GB'],
        };
    }
    const data = snap.data();
    return {
        freeShippingThreshold: data.freeShippingThreshold ?? 50,
        standardShippingFee: data.standardShippingFee ?? 4.99,
        supportedRegions: data.supportedRegions ?? ['GB'],
    };
}

/** Get click & collect config */
export async function getClickAndCollectConfig(): Promise<ClickAndCollectConfig> {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    if (!snap.exists()) {
        return {
            enabled: true,
            storeName: 'Seba Digital',
            storeAddress: 'West Ealing, London',
            operatingHours: {
                monday: '9:00 AM – 6:00 PM',
                tuesday: '9:00 AM – 6:00 PM',
                wednesday: '9:00 AM – 6:00 PM',
                thursday: '9:00 AM – 6:00 PM',
                friday: '9:00 AM – 6:00 PM',
                saturday: '9:00 AM – 5:00 PM',
                sunday: 'Closed',
            },
        };
    }
    const data = snap.data();
    return {
        enabled: data.store?.clickAndCollectEnabled ?? true,
        storeName: data.store?.name ?? 'Seba Digital',
        storeAddress: data.store?.address ?? 'West Ealing, London',
        operatingHours: data.store?.operatingHours ?? {},
    };
}

/** Check if a postcode is within a supported region */
export function isRegionSupported(country: string, supportedRegions: string[]): boolean {
    return supportedRegions.includes(country.toUpperCase());
}

// ─── Shipping Status Updates (on orders) ─────────────────────────────

/** Mark order as dispatched with tracking details */
export async function dispatchOrder(
    orderId: string,
    courier: string,
    trackingNumber: string
): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), {
        status: 'dispatched',
        'shipping.courier': courier,
        'shipping.trackingNumber': trackingNumber,
        'shipping.dispatchDate': serverTimestamp(),
        'shipping.shippingStatus': 'dispatched',
        updatedAt: serverTimestamp(),
    });
}

/** Mark as in transit */
export async function markInTransit(orderId: string): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), {
        'shipping.shippingStatus': 'in_transit',
        updatedAt: serverTimestamp(),
    });
}

/** Mark as delivered */
export async function markDelivered(orderId: string): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), {
        status: 'delivered',
        'shipping.deliveryDate': serverTimestamp(),
        'shipping.shippingStatus': 'delivered',
        updatedAt: serverTimestamp(),
    });
}

// ─── Click & Collect Status Updates ──────────────────────────────────

/** Mark click & collect order as ready */
export async function markReadyForCollection(orderId: string): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), {
        'clickAndCollect.status': 'ready_for_collection',
        'clickAndCollect.readyAt': serverTimestamp(),
        'clickAndCollect.notificationSent': true,
        updatedAt: serverTimestamp(),
    });
}

/** Mark click & collect order as collected */
export async function markCollected(
    orderId: string,
    handedOverBy: string,
    verificationNotes: string = ''
): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), {
        status: 'delivered',
        'clickAndCollect.status': 'collected',
        'clickAndCollect.collectedAt': serverTimestamp(),
        'clickAndCollect.handedOverBy': handedOverBy,
        'clickAndCollect.verificationNotes': verificationNotes,
        updatedAt: serverTimestamp(),
    });
}

/** Cancel a click & collect order */
export async function cancelClickAndCollect(orderId: string): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        'clickAndCollect.status': 'cancelled',
        updatedAt: serverTimestamp(),
    });
}
