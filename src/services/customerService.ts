import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    increment,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────
export interface Address {
    line1: string;
    line2: string;
    city: string;
    county: string;
    postcode: string;
    country: string;
}

export interface Customer {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isVerified: boolean;
    isNewsletterSubscribed: boolean;
    newsletterConsentAt: any | null;
    shippingAddress: Address;
    billingAddress: Address;
    orderCount: number;
    totalSpent: number;
    createdAt?: any;
    updatedAt?: any;
}

// ─── Collection Reference ────────────────────────────────────────────
const customersCol = collection(db, 'customers');

// ─── Customer CRUD ───────────────────────────────────────────────────

/** Create or update a customer (uses customerId as doc ID, e.g., from Auth UID) */
export async function createCustomer(
    customerId: string,
    data: Omit<Customer, 'id' | 'orderCount' | 'totalSpent' | 'createdAt' | 'updatedAt'>
): Promise<void> {
    await setDoc(doc(db, 'customers', customerId), {
        ...data,
        orderCount: 0,
        totalSpent: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

/** Get a customer by ID */
export async function getCustomerById(customerId: string): Promise<Customer | null> {
    const snap = await getDoc(doc(db, 'customers', customerId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Customer;
}

/** Get a customer by email */
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
    const q = query(customersCol, where('email', '==', email), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as Customer;
}

/** Get all customers */
export async function getCustomers(): Promise<Customer[]> {
    const q = query(customersCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
}

/** Update customer profile */
export async function updateCustomer(customerId: string, data: Partial<Customer>): Promise<void> {
    await updateDoc(doc(db, 'customers', customerId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/** Mark a customer as verified */
export async function verifyCustomer(customerId: string): Promise<void> {
    await updateDoc(doc(db, 'customers', customerId), {
        isVerified: true,
        updatedAt: serverTimestamp(),
    });
}

/** Update customer order stats (call after a completed order) */
export async function incrementCustomerOrderStats(
    customerId: string,
    orderTotal: number
): Promise<void> {
    await updateDoc(doc(db, 'customers', customerId), {
        orderCount: increment(1),
        totalSpent: increment(orderTotal),
        updatedAt: serverTimestamp(),
    });
}

/** Update shipping address */
export async function updateShippingAddress(
    customerId: string,
    address: Address
): Promise<void> {
    await updateDoc(doc(db, 'customers', customerId), {
        shippingAddress: address,
        updatedAt: serverTimestamp(),
    });
}

/** Update billing address */
export async function updateBillingAddress(
    customerId: string,
    address: Address
): Promise<void> {
    await updateDoc(doc(db, 'customers', customerId), {
        billingAddress: address,
        updatedAt: serverTimestamp(),
    });
}

/** Subscribe / unsubscribe from newsletter */
export async function updateNewsletterSubscription(
    customerId: string,
    subscribed: boolean
): Promise<void> {
    await updateDoc(doc(db, 'customers', customerId), {
        isNewsletterSubscribed: subscribed,
        newsletterConsentAt: subscribed ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
    });
}

/** Delete a customer */
export async function deleteCustomer(customerId: string): Promise<void> {
    await deleteDoc(doc(db, 'customers', customerId));
}
