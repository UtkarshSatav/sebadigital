import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    Timestamp,
    DocumentSnapshot,
    QueryConstraint,
    runTransaction,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────
export interface OrderLineItem {
    productId: string;
    title: string;
    sku: string;
    image: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    vatAmount: number;
    lineTotal: number;
    lineTotalIncVat: number;
}

export interface OrderPricing {
    subtotal: number;
    vatTotal: number;
    shippingFee: number;
    discountAmount: number;
    discountCode: string | null;
    grandTotal: number;
}

export interface OrderPayment {
    method: string;
    transactionId: string;
    status: 'pending' | 'completed' | 'refunded' | 'failed';
    paidAt: Timestamp | null;
    cardType: string | null;
}

export interface OrderShipping {
    address: {
        line1: string;
        line2: string;
        city: string;
        county: string;
        postcode: string;
        country: string;
    };
    courier: string | null;
    trackingNumber: string | null;
    dispatchDate: Timestamp | null;
    deliveryDate: Timestamp | null;
    shippingStatus: 'pending' | 'dispatched' | 'in_transit' | 'delivered';
}

export interface ClickAndCollect {
    status: 'pending_collection' | 'ready_for_collection' | 'collected' | 'cancelled';
    readyAt: Timestamp | null;
    collectedAt: Timestamp | null;
    handedOverBy: string;
    verificationNotes: string;
    notificationSent: boolean;
}

export type OrderStatus =
    | 'pending_payment'
    | 'paid'
    | 'packed'
    | 'dispatched'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export interface Order {
    id?: string;
    orderNumber: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    orderType: 'product' | 'media_transfer' | 'mixed';
    status: OrderStatus;
    deliveryMethod: 'shipping' | 'click_and_collect';
    lineItems: OrderLineItem[];
    pricing: OrderPricing;
    payment: OrderPayment;
    shipping: OrderShipping | null;
    clickAndCollect: ClickAndCollect | null;
    notes: string;
    createdAt?: any;
    updatedAt?: any;
}

// ─── Collection Reference ────────────────────────────────────────────
const ordersCol = collection(db, 'orders');

// ─── Helpers ─────────────────────────────────────────────────────────

/** Generate a human-readable order number: SEB-YYYYMMDD-NNN */
export function generateOrderNumber(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 900 + 100);
    return `SEB-${date}-${rand}`;
}

/** Calculate line item totals with VAT */
export function calculateLineItem(
    unitPrice: number,
    quantity: number,
    vatRate: number = 0.2
): Pick<OrderLineItem, 'vatAmount' | 'lineTotal' | 'lineTotalIncVat'> {
    const lineTotal = parseFloat((unitPrice * quantity).toFixed(2));
    const vatAmount = parseFloat((lineTotal * vatRate).toFixed(2));
    const lineTotalIncVat = parseFloat((lineTotal + vatAmount).toFixed(2));
    return { vatAmount, lineTotal, lineTotalIncVat };
}

/** Calculate full order pricing from line items */
export function calculateOrderPricing(
    lineItems: OrderLineItem[],
    shippingFee: number,
    discountAmount: number = 0,
    discountCode: string | null = null
): OrderPricing {
    const subtotal = parseFloat(
        lineItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
    );
    const vatTotal = parseFloat(
        lineItems.reduce((sum, item) => sum + item.vatAmount, 0).toFixed(2)
    );
    const grandTotal = parseFloat(
        (subtotal + vatTotal + shippingFee - discountAmount).toFixed(2)
    );
    return { subtotal, vatTotal, shippingFee, discountAmount, discountCode, grandTotal };
}

/** Determine shipping fee based on subtotal and threshold */
export function getShippingFee(
    subtotalIncVat: number,
    freeThreshold: number = 50,
    standardFee: number = 4.99
): number {
    return subtotalIncVat >= freeThreshold ? 0 : standardFee;
}

// ─── Order CRUD ──────────────────────────────────────────────────────

/** Create a new order */
export async function createOrder(
    order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    const orderNumber = generateOrderNumber();
    const docRef = await addDoc(ordersCol, {
        ...order,
        orderNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/** Get an order by ID */
export async function getOrderById(orderId: string): Promise<Order | null> {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Order;
}

/** Get orders with filters (admin dashboard) */
export async function getOrders(filters?: {
    customerId?: string;
    status?: OrderStatus;
    orderType?: string;
    paymentStatus?: string;
    limitCount?: number;
    lastDoc?: DocumentSnapshot;
}): Promise<{ orders: Order[]; lastDoc: DocumentSnapshot | null }> {
    const constraints: QueryConstraint[] = [];

    if (filters?.customerId) {
        constraints.push(where('customerId', '==', filters.customerId));
    }
    if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
    }
    if (filters?.orderType) {
        constraints.push(where('orderType', '==', filters.orderType));
    }
    if (filters?.paymentStatus) {
        constraints.push(where('payment.status', '==', filters.paymentStatus));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters?.limitCount) {
        constraints.push(limit(filters.limitCount));
    }
    if (filters?.lastDoc) {
        constraints.push(startAfter(filters.lastDoc));
    }

    const q = query(ordersCol, ...constraints);
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { orders, lastDoc: lastVisible };
}

/** Update order status */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp(),
    });
}

/** Update payment info (after PayPal callback) */
export async function updateOrderPayment(
    orderId: string,
    payment: Partial<OrderPayment>
): Promise<void> {
    const updates: Record<string, any> = { updatedAt: serverTimestamp() };
    Object.entries(payment).forEach(([key, value]) => {
        updates[`payment.${key}`] = value;
    });
    await updateDoc(doc(db, 'orders', orderId), updates);
}

/** Update shipping details */
export async function updateOrderShipping(
    orderId: string,
    shipping: Partial<OrderShipping>
): Promise<void> {
    const updates: Record<string, any> = { updatedAt: serverTimestamp() };
    Object.entries(shipping).forEach(([key, value]) => {
        updates[`shipping.${key}`] = value;
    });
    await updateDoc(doc(db, 'orders', orderId), updates);
}

/** Update click & collect status */
export async function updateClickAndCollect(
    orderId: string,
    data: Partial<ClickAndCollect>
): Promise<void> {
    const updates: Record<string, any> = { updatedAt: serverTimestamp() };
    Object.entries(data).forEach(([key, value]) => {
        updates[`clickAndCollect.${key}`] = value;
    });
    await updateDoc(doc(db, 'orders', orderId), updates);
}

/** Get orders by date range (admin reports) */
export async function getOrdersByDateRange(
    startDate: Date,
    endDate: Date
): Promise<Order[]> {
    const q = query(
        ordersCol,
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

/** Get today's orders count and revenue */
export async function getTodaysOrderSummary(): Promise<{
    count: number;
    revenue: number;
}> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await getOrdersByDateRange(today, tomorrow);
    const revenue = orders.reduce((sum, o) => sum + o.pricing.grandTotal, 0);
    return { count: orders.length, revenue: parseFloat(revenue.toFixed(2)) };
}
