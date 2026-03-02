import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as cors from 'cors';

admin.initializeApp();

const corsHandler = cors({ origin: true });

// ─── PayPal Config (from Firebase env / .env file) ───────────────────────────

const PAYPAL_ENV = process.env.PAYPAL_ENV || 'production';
const PAYPAL_API_BASE = PAYPAL_ENV === 'sandbox'
    ? 'https://api-3t.sandbox.paypal.com/nvp'
    : 'https://api-3t.paypal.com/nvp';

const PAYPAL_CREDENTIALS = {
    USER: process.env.PAYPAL_API_USERNAME || '',
    PWD: process.env.PAYPAL_API_PASSWORD || '',
    SIGNATURE: process.env.PAYPAL_API_SIGNATURE || '',
    VERSION: '204',
};

// ─── Royal Mail Config ────────────────────────────────────────────────────────

const ROYAL_MAIL_API_BASE = 'https://api.royalmail.net';
const ROYAL_MAIL_API_KEY = process.env.ROYAL_MAIL_API_KEY || '';
const ROYAL_MAIL_ACCOUNT_ID = process.env.ROYAL_MAIL_ACCOUNT_ID || '';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildNvpParams(method: string, extra: Record<string, string>): URLSearchParams {
    const params = new URLSearchParams({
        METHOD: method,
        ...PAYPAL_CREDENTIALS,
        ...extra,
    });
    return params;
}

// ─── Cloud Function: createPayPalOrder ────────────────────────────────────────

export const createPayPalOrder = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }
        try {
            const { amount, orderDescription, items } = req.body;

            // Use PayPal Orders REST API directly (v2) which is modern + works with Smart Buttons
            const restBase = PAYPAL_ENV === 'sandbox'
                ? 'https://api-m.sandbox.paypal.com'
                : 'https://api-m.paypal.com';

            // Get access token using NVP credentials won't work with REST — 
            // For full compatibility we store the REST Client ID in PayPal dashboard
            // and use the NVP API for server-side verification

            // NVP: SetExpressCheckout
            const params = buildNvpParams('SetExpressCheckout', {
                RETURNURL: `${req.headers.origin}/checkout?status=success`,
                CANCELURL: `${req.headers.origin}/checkout?status=cancel`,
                PAYMENTREQUEST_0_AMT: Number(amount).toFixed(2),
                PAYMENTREQUEST_0_CURRENCYCODE: 'GBP',
                PAYMENTREQUEST_0_DESC: orderDescription,
                PAYMENTREQUEST_0_PAYMENTACTION: 'Sale',
                PAYMENTREQUEST_0_ITEMAMT: Number(amount).toFixed(2),
                ...(items?.reduce?.((acc: any, item: any, i: number) => ({
                    ...acc,
                    [`L_PAYMENTREQUEST_0_NAME${i}`]: item.name,
                    [`L_PAYMENTREQUEST_0_QTY${i}`]: String(item.quantity),
                    [`L_PAYMENTREQUEST_0_AMT${i}`]: Number(item.unitAmount).toFixed(2),
                }), {}) || {}),
            });

            const nvpRes = await axios.post(PAYPAL_API_BASE, params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            const parsed = new URLSearchParams(nvpRes.data);
            const token = parsed.get('TOKEN');
            const ack = parsed.get('ACK');

            if (ack === 'Success' || ack === 'SuccessWithWarning') {
                res.json({ orderId: token, checkoutUrl: `https://www.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=${token}` });
            } else {
                const errMsg = parsed.get('L_LONGMESSAGE0') || 'PayPal error';
                functions.logger.error('PayPal SetExpressCheckout failed:', errMsg);
                res.status(500).json({ error: errMsg });
            }
        } catch (err: any) {
            functions.logger.error('createPayPalOrder error:', err.message);
            res.status(500).json({ error: err.message });
        }
    });
});

// ─── Cloud Function: capturePayPalOrder ──────────────────────────────────────

export const capturePayPalOrder = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }
        try {
            const { token, payerId } = req.body;

            // NVP: DoExpressCheckoutPayment
            const params = buildNvpParams('DoExpressCheckoutPayment', {
                TOKEN: token,
                PAYERID: payerId,
                PAYMENTREQUEST_0_PAYMENTACTION: 'Sale',
                PAYMENTREQUEST_0_CURRENCYCODE: 'GBP',
            });

            const nvpRes = await axios.post(PAYPAL_API_BASE, params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            const parsed = new URLSearchParams(nvpRes.data);
            const ack = parsed.get('ACK');

            if (ack === 'Success' || ack === 'SuccessWithWarning') {
                const txnId = parsed.get('PAYMENTREQUEST_0_TRANSACTIONID') || '';
                res.json({
                    transactionId: txnId,
                    payerEmail: parsed.get('EMAIL') || '',
                    status: parsed.get('PAYMENTREQUEST_0_PAYMENTSTATUS') || 'Completed',
                });
            } else {
                const errMsg = parsed.get('L_LONGMESSAGE0') || 'Capture failed';
                functions.logger.error('PayPal DoExpressCheckout failed:', errMsg);
                res.status(500).json({ error: errMsg });
            }
        } catch (err: any) {
            functions.logger.error('capturePayPalOrder error:', err.message);
            res.status(500).json({ error: err.message });
        }
    });
});

// ─── Cloud Function: createRoyalMailShipment ─────────────────────────────────

export const createRoyalMailShipment = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }
        try {
            const { orderId, orderNumber, recipient, packageWeightGrams, serviceType } = req.body;

            if (!ROYAL_MAIL_API_KEY) {
                // Return simulated tracking number when API key not configured
                const fakeTracking = `RM${Date.now().toString(36).toUpperCase()}GB`;
                res.json({ success: true, trackingNumber: fakeTracking, simulated: true });
                return;
            }

            // Click & Drop API v2
            const shipmentPayload = {
                shipments: [{
                    senderReference: orderNumber,
                    service: { format: 'PARCELS', offering: serviceType },
                    destination: {
                        address: {
                            fullName: recipient.name,
                            line1: recipient.addressLine1,
                            line2: recipient.addressLine2 || '',
                            city: recipient.city,
                            county: recipient.county || '',
                            postcode: recipient.postcode,
                            countryCode: recipient.countryCode || 'GB',
                        },
                        email: recipient.email,
                        mobilePhone: recipient.phone,
                    },
                    packages: [{
                        weightInGrams: packageWeightGrams,
                    }],
                }],
            };

            const rmRes = await axios.post(
                `${ROYAL_MAIL_API_BASE}/v2/orders`,
                shipmentPayload,
                {
                    headers: {
                        'X-IBM-Client-Id': ROYAL_MAIL_API_KEY,
                        'X-Account-Id': ROYAL_MAIL_ACCOUNT_ID,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );

            const shipment = rmRes.data?.shipments?.[0];
            const tracking = shipment?.trackingNumber;
            const labelUrl = shipment?.label?.pdf;

            // Update Firestore order with tracking info
            if (orderId && tracking) {
                await admin.firestore().collection('orders').doc(orderId).update({
                    'shipping.trackingNumber': tracking,
                    'shipping.courier': 'Royal Mail',
                    'shipping.shippingStatus': 'dispatched',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            functions.logger.info(`Royal Mail shipment created: ${tracking} for order ${orderNumber}`);
            res.json({ success: true, trackingNumber: tracking, labelUrl });
        } catch (err: any) {
            functions.logger.error('createRoyalMailShipment error:', err.response?.data || err.message);
            res.status(500).json({ success: false, error: err.response?.data?.message || err.message });
        }
    });
});

// ─── Cloud Function: getRoyalMailTracking ─────────────────────────────────────

export const getRoyalMailTracking = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        const { trackingNumber } = req.query;
        if (!trackingNumber) { res.status(400).json({ error: 'Missing trackingNumber' }); return; }

        try {
            if (!ROYAL_MAIL_API_KEY) {
                res.json({ status: 'Unknown', events: [] });
                return;
            }

            const rmRes = await axios.get(
                `${ROYAL_MAIL_API_BASE}/tracking/v1/${trackingNumber}`,
                {
                    headers: {
                        'X-IBM-Client-Id': ROYAL_MAIL_API_KEY,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const events = rmRes.data?.events?.map((e: any) => ({
                datetime: e.eventTimestamp,
                location: e.eventLocation,
                description: e.eventDescription,
            })) || [];

            res.json({ status: rmRes.data?.statusDescription || 'In Transit', events });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });
});
