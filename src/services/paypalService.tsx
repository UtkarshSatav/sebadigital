import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer,
} from '@paypal/react-paypal-js';

const RAW_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
// Use 'sb' (PayPal sandbox) if the Client ID is not yet configured
const PAYPAL_CLIENT_ID = (RAW_CLIENT_ID && RAW_CLIENT_ID.trim() !== '' && RAW_CLIENT_ID !== 'YOUR_PAYPAL_CLIENT_ID_HERE')
    ? RAW_CLIENT_ID.trim()
    : 'sb';
const IS_SANDBOX = PAYPAL_CLIENT_ID === 'sb';
const PAYPAL_RECEIVER_EMAIL = import.meta.env.VITE_PAYPAL_RECEIVER_EMAIL || 'sebadigital@hotmail.co.uk';
const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE_URL || '';

// ─── PayPal Provider wrapper ─────────────────────────────────────────────────

export function PayPalProvider({ children }: { children: React.ReactNode }) {
    return (
        <PayPalScriptProvider
            options={{
                clientId: PAYPAL_CLIENT_ID,
                currency: 'GBP',
                intent: 'capture',
                components: 'buttons',
            }}
        >
            {IS_SANDBOX && (
                <div className="mb-3 px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-800 font-medium">
                    ⚠️ <strong>PayPal not yet configured.</strong> Payments are in test/sandbox mode.
                    <br />
                    <span className="text-xs font-normal">
                        To accept live payments, add your PayPal <strong>Live Client ID</strong> to{' '}
                        <code className="font-mono bg-amber-100 px-1 rounded">.env</code>{' '}as{' '}
                        <code className="font-mono bg-amber-100 px-1 rounded">VITE_PAYPAL_CLIENT_ID</code>.
                        Get it at{' '}
                        <a href="https://developer.paypal.com" target="_blank" rel="noreferrer" className="underline">
                            developer.paypal.com
                        </a>.
                    </span>
                </div>
            )}
            {children}
        </PayPalScriptProvider>
    );
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PayPalOrderDetails {
    amount: number; // in GBP
    orderDescription: string;
    items: Array<{
        name: string;
        quantity: number;
        unitAmount: number;
    }>;
    shippingAddress?: {
        line1: string;
        city: string;
        postcode: string;
        country: string;
    };
}

// ─── Checkout Buttons Component ──────────────────────────────────────────────

interface PayPalCheckoutButtonsProps {
    orderDetails: PayPalOrderDetails;
    onSuccess: (transactionId: string, payerEmail: string) => void;
    onError: (err: any) => void;
}

function LoadingSpinner() {
    const [{ isPending }] = usePayPalScriptReducer();
    if (!isPending) return null;
    return (
        <div className="flex items-center justify-center py-6">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export function PayPalCheckoutButtons({ orderDetails, onSuccess, onError }: PayPalCheckoutButtonsProps) {
    const createOrder = async (_data: any, actions: any) => {
        // Try calling Firebase Function first, fall back to client-side creation
        if (FUNCTIONS_BASE) {
            try {
                const res = await fetch(`${FUNCTIONS_BASE}/createPayPalOrder`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderDetails),
                });
                const data = await res.json();
                if (data.orderId) return data.orderId;
            } catch { /* fall through to client-side */ }
        }

        // Client-side fallback (works when Functions aren't deployed yet)
        return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
                description: orderDetails.orderDescription,
                amount: {
                    currency_code: 'GBP',
                    value: orderDetails.amount.toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: 'GBP',
                            value: orderDetails.amount.toFixed(2),
                        },
                    },
                },
                items: orderDetails.items.map(item => ({
                    name: item.name,
                    quantity: String(item.quantity),
                    unit_amount: {
                        currency_code: 'GBP',
                        value: item.unitAmount.toFixed(2),
                    },
                })),
                payee: {
                    email_address: PAYPAL_RECEIVER_EMAIL,
                },
            }],
            application_context: {
                brand_name: 'Seba Digital',
                locale: 'en-GB',
                user_action: 'PAY_NOW',
                return_url: `${window.location.origin}/checkout?status=success`,
                cancel_url: `${window.location.origin}/checkout?status=cancel`,
            },
        });
    };

    const onApprove = async (data: any, actions: any) => {
        try {
            let details;

            if (FUNCTIONS_BASE) {
                try {
                    const res = await fetch(`${FUNCTIONS_BASE}/capturePayPalOrder`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: data.orderID }),
                    });
                    details = await res.json();
                } catch { /* fall through */ }
            }

            if (!details) {
                details = await actions.order.capture();
            }

            const transactionId = details.purchase_units?.[0]?.payments?.captures?.[0]?.id || data.orderID;
            const payerEmail = details.payer?.email_address || '';
            onSuccess(transactionId, payerEmail);
        } catch (err) {
            onError(err);
        }
    };

    return (
        <>
            <LoadingSpinner />
            <PayPalButtons
                style={{
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'pay',
                    height: 48,
                }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                onCancel={() => onError(new Error('Payment cancelled by user'))}
            />
        </>
    );
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Format currency for display */
export function formatGBP(amount: number): string {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}
