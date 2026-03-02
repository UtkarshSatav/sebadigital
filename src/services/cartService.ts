import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────
export interface CartItem {
    productId: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    sku?: string;
    categorySlug?: string;
    brandId?: string;
}

export interface Cart {
    items: CartItem[];
    updatedAt?: any;
}

// ─── Firestore Cart Persistence ──────────────────────────────────────
// These persist the cart for logged-in users.
// For guest users, the existing React Context (CartContext) handles
// in-memory cart state. When a user logs in, you can merge the
// localStorage/context cart into Firestore.

const CARTS_COLLECTION = 'carts';

/** Save cart to Firestore (for logged-in users) */
export async function saveCart(userId: string, items: CartItem[]): Promise<void> {
    await setDoc(doc(db, CARTS_COLLECTION, userId), {
        items,
        updatedAt: serverTimestamp(),
    });
}

/** Load cart from Firestore */
export async function loadCart(userId: string): Promise<CartItem[]> {
    const snap = await getDoc(doc(db, CARTS_COLLECTION, userId));
    if (!snap.exists()) return [];
    return (snap.data().items || []) as CartItem[];
}

/** Clear cart in Firestore */
export async function clearCart(userId: string): Promise<void> {
    await deleteDoc(doc(db, CARTS_COLLECTION, userId));
}

/** Merge guest cart into existing Firestore cart (at login) */
export async function mergeGuestCart(userId: string, guestItems: CartItem[]): Promise<CartItem[]> {
    const existingItems = await loadCart(userId);

    const merged = [...existingItems];

    guestItems.forEach((guestItem) => {
        const existingIndex = merged.findIndex((item) => item.productId === guestItem.productId);
        if (existingIndex >= 0) {
            // Add quantities
            merged[existingIndex].quantity += guestItem.quantity;
        } else {
            merged.push(guestItem);
        }
    });

    await saveCart(userId, merged);
    return merged;
}

// ─── Cart Utility Functions ──────────────────────────────────────────

/** Calculate cart subtotal (ex-VAT) */
export function getCartSubtotal(items: CartItem[]): number {
    return parseFloat(
        items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    );
}

/** Calculate cart VAT total */
export function getCartVat(items: CartItem[], vatRate: number = 0.2): number {
    return parseFloat(
        items.reduce((sum, item) => sum + item.price * item.quantity * vatRate, 0).toFixed(2)
    );
}

/** Calculate cart total (inc VAT) */
export function getCartTotalIncVat(items: CartItem[], vatRate: number = 0.2): number {
    const subtotal = getCartSubtotal(items);
    const vat = getCartVat(items, vatRate);
    return parseFloat((subtotal + vat).toFixed(2));
}

/** Get total item count */
export function getCartItemCount(items: CartItem[]): number {
    return items.reduce((count, item) => count + item.quantity, 0);
}
