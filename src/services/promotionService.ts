import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    increment,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────
export interface Promotion {
    id?: string;
    title: string;
    description: string;
    promoCode: string | null;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    applicableTo: {
        categoryIds: string[];
        brandIds: string[];
        productIds: string[];
    };
    startDate: Timestamp;
    endDate: Timestamp;
    usageLimit: number | null;
    usageCount: number;
    isActive: boolean;
    bannerImage: string | null;
    createdAt?: any;
    updatedAt?: any;
}

// ─── Collection Reference ────────────────────────────────────────────
const promotionsCol = collection(db, 'promotions');

// ─── Promotions CRUD ─────────────────────────────────────────────────

/** Get all active promotions */
export async function getActivePromotions(): Promise<Promotion[]> {
    const now = Timestamp.now();
    const q = query(
        promotionsCol,
        where('isActive', '==', true),
        where('endDate', '>=', now),
        orderBy('endDate', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Promotion));
}

/** Get all promotions (admin) */
export async function getAllPromotions(): Promise<Promotion[]> {
    const q = query(promotionsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Promotion));
}

/** Get a promotion by ID */
export async function getPromotionById(promoId: string): Promise<Promotion | null> {
    const snap = await getDoc(doc(db, 'promotions', promoId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Promotion;
}

/** Validate and get promotion by promo code */
export async function getPromotionByCode(code: string): Promise<Promotion | null> {
    const q = query(
        promotionsCol,
        where('promoCode', '==', code.toUpperCase()),
        where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const promo = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Promotion;

    // Check date validity
    const now = new Date();
    if (promo.startDate.toDate() > now || promo.endDate.toDate() < now) {
        return null;
    }

    // Check usage limit
    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
        return null;
    }

    return promo;
}

/** Calculate discount amount for a cart */
export function calculateDiscount(
    promo: Promotion,
    subtotal: number,
    lineItems: Array<{ productId: string; categorySlug: string; brandId: string; lineTotal: number }>
): number {
    // Filter applicable items
    let applicableTotal = subtotal;

    const hasFilters =
        promo.applicableTo.categoryIds.length > 0 ||
        promo.applicableTo.brandIds.length > 0 ||
        promo.applicableTo.productIds.length > 0;

    if (hasFilters) {
        applicableTotal = lineItems
            .filter(
                (item) =>
                    promo.applicableTo.productIds.includes(item.productId) ||
                    promo.applicableTo.categoryIds.includes(item.categorySlug) ||
                    promo.applicableTo.brandIds.includes(item.brandId)
            )
            .reduce((sum, item) => sum + item.lineTotal, 0);
    }

    if (applicableTotal <= 0) return 0;

    if (promo.discountType === 'percentage') {
        return parseFloat(((applicableTotal * promo.discountValue) / 100).toFixed(2));
    } else {
        return Math.min(promo.discountValue, applicableTotal);
    }
}

/** Increment promo usage count (call after order is placed) */
export async function incrementPromoUsage(promoId: string): Promise<void> {
    await updateDoc(doc(db, 'promotions', promoId), {
        usageCount: increment(1),
        updatedAt: serverTimestamp(),
    });
}

/** Create a new promotion */
export async function createPromotion(
    promo: Omit<Promotion, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    const docRef = await addDoc(promotionsCol, {
        ...promo,
        promoCode: promo.promoCode ? promo.promoCode.toUpperCase() : null,
        usageCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/** Update a promotion */
export async function updatePromotion(promoId: string, data: Partial<Promotion>): Promise<void> {
    if (data.promoCode) {
        data.promoCode = data.promoCode.toUpperCase();
    }
    await updateDoc(doc(db, 'promotions', promoId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/** Delete a promotion */
export async function deletePromotion(promoId: string): Promise<void> {
    await deleteDoc(doc(db, 'promotions', promoId));
}
