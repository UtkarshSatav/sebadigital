/**
 * Royal Mail Click & Drop Service
 * 
 * This service calls Firebase Cloud Functions which securely hold the
 * Royal Mail API key. The key is NEVER exposed in the frontend.
 * 
 * API docs: https://developer.royalmail.net/click-drop
 */

const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE_URL || '';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RoyalMailRecipient {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    county?: string;
    postcode: string;
    countryCode: string; // 'GB'
    phone?: string;
    email?: string;
}

export interface RoyalMailShipmentRequest {
    orderId: string;
    orderNumber: string;
    recipient: RoyalMailRecipient;
    packageWeightGrams: number;
    serviceType: 'CRL48' | 'CRL24' | 'STL1' | 'STL2'; // 48h tracked, 24h tracked, 1st class, 2nd class
    safePlace?: string;
    specialInstructions?: string;
}

export interface RoyalMailShipmentResponse {
    success: boolean;
    trackingNumber?: string;
    labelUrl?: string;
    shipmentId?: string;
    error?: string;
}

// ─── Service Types ────────────────────────────────────────────────────────────

/** Available Royal Mail tracked services */
export const ROYAL_MAIL_SERVICES = [
    { code: 'CRL24', label: 'Tracked 24 (Next day)', price: 3.55 },
    { code: 'CRL48', label: 'Tracked 48 (2-3 days)', price: 2.85 },
    { code: 'STL1', label: '1st Class', price: 1.25 },
    { code: 'STL2', label: '2nd Class', price: 1.10 },
] as const;

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Create a Royal Mail shipment via Firebase Cloud Function.
 * Returns tracking number and label URL when successful.
 */
export async function createRoyalMailShipment(
    request: RoyalMailShipmentRequest
): Promise<RoyalMailShipmentResponse> {
    if (!FUNCTIONS_BASE) {
        console.warn('Royal Mail: VITE_FUNCTIONS_BASE_URL not configured. Simulating shipment.');
        return {
            success: true,
            trackingNumber: `RM${Date.now().toString(36).toUpperCase()}GB`,
            shipmentId: `SIM-${Date.now()}`,
        };
    }

    try {
        const res = await fetch(`${FUNCTIONS_BASE}/createRoyalMailShipment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        const data = await res.json();

        if (!res.ok) {
            return { success: false, error: data.error || `HTTP ${res.status}` };
        }

        return {
            success: true,
            trackingNumber: data.trackingNumber,
            labelUrl: data.labelUrl,
            shipmentId: data.shipmentId,
        };
    } catch (err: any) {
        return { success: false, error: err.message || 'Network error' };
    }
}

/**
 * Get tracking info for a Royal Mail shipment.
 */
export async function getRoyalMailTracking(trackingNumber: string): Promise<{
    status: string;
    events: Array<{ datetime: string; location: string; description: string }>;
}> {
    if (!FUNCTIONS_BASE) {
        return { status: 'In Transit', events: [] };
    }
    const res = await fetch(`${FUNCTIONS_BASE}/getRoyalMailTracking?trackingNumber=${trackingNumber}`);
    return res.json();
}

/**
 * Build the Royal Mail tracking URL for display.
 */
export function getRoyalMailTrackingUrl(trackingNumber: string): string {
    return `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`;
}
