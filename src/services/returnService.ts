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
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'received' | 'refunded';

export interface ReturnRefund {
    amount: number;
    method: 'paypal' | 'store_credit';
    referenceId: string;
    processedAt: any | null;
    notes: string;
}

export interface ReturnRequest {
    id?: string;
    orderId: string;
    orderNumber: string;
    customerId: string;
    lineItemIndex: number;
    productId: string;
    productTitle: string;
    quantity: number;
    reason: string;
    status: ReturnStatus;
    refund: ReturnRefund;
    policyReference: string;
    createdAt?: any;
    updatedAt?: any;
}

// ─── Collection Reference ────────────────────────────────────────────
const returnsCol = collection(db, 'returns');

// ─── Returns CRUD ────────────────────────────────────────────────────

/** Create a return request */
export async function createReturnRequest(
    data: Omit<ReturnRequest, 'id' | 'status' | 'refund' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    const docRef = await addDoc(returnsCol, {
        ...data,
        status: 'requested' as ReturnStatus,
        refund: {
            amount: 0,
            method: 'paypal',
            referenceId: '',
            processedAt: null,
            notes: '',
        },
        policyReference: data.policyReference || 'returns_policy_v1',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/** Get a return by ID */
export async function getReturnById(returnId: string): Promise<ReturnRequest | null> {
    const snap = await getDoc(doc(db, 'returns', returnId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as ReturnRequest;
}

/** Get all returns (admin) */
export async function getAllReturns(): Promise<ReturnRequest[]> {
    const q = query(returnsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ReturnRequest));
}

/** Get returns by order */
export async function getReturnsByOrder(orderId: string): Promise<ReturnRequest[]> {
    const q = query(returnsCol, where('orderId', '==', orderId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ReturnRequest));
}

/** Get returns by status (admin filter) */
export async function getReturnsByStatus(status: ReturnStatus): Promise<ReturnRequest[]> {
    const q = query(returnsCol, where('status', '==', status), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ReturnRequest));
}

/** Get in-progress returns count (admin dashboard) */
export async function getInProgressReturnsCount(): Promise<number> {
    const q = query(
        returnsCol,
        where('status', 'in', ['requested', 'approved', 'received'])
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
}

// ─── Status Transitions ──────────────────────────────────────────────

/** Approve a return */
export async function approveReturn(returnId: string): Promise<void> {
    await updateDoc(doc(db, 'returns', returnId), {
        status: 'approved',
        updatedAt: serverTimestamp(),
    });
}

/** Reject a return */
export async function rejectReturn(returnId: string, notes: string = ''): Promise<void> {
    await updateDoc(doc(db, 'returns', returnId), {
        status: 'rejected',
        'refund.notes': notes,
        updatedAt: serverTimestamp(),
    });
}

/** Mark return as received (item arrived back) */
export async function markReturnReceived(returnId: string): Promise<void> {
    await updateDoc(doc(db, 'returns', returnId), {
        status: 'received',
        updatedAt: serverTimestamp(),
    });
}

/** Process refund */
export async function processRefund(
    returnId: string,
    refundData: {
        amount: number;
        method: 'paypal' | 'store_credit';
        referenceId: string;
        notes?: string;
    }
): Promise<void> {
    await updateDoc(doc(db, 'returns', returnId), {
        status: 'refunded',
        'refund.amount': refundData.amount,
        'refund.method': refundData.method,
        'refund.referenceId': refundData.referenceId,
        'refund.processedAt': serverTimestamp(),
        'refund.notes': refundData.notes || '',
        updatedAt: serverTimestamp(),
    });
}
