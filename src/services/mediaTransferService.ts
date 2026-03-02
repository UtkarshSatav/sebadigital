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
export type TapeFormat =
    | 'VHS'
    | 'VHS-C'
    | 'Video8'
    | 'Hi8'
    | 'Digital8'
    | 'MiniDV'
    | 'Mini DVD'
    | 'AudioCassette';

export type OutputFormat = 'DVD' | 'CD';

export type MediaTransferStatus =
    | 'quote_requested'
    | 'quote_sent'
    | 'customer_confirmed'
    | 'media_received'
    | 'in_transfer'
    | 'completed'
    | 'invoiced'
    | 'returned';

export interface TapeItem {
    format: TapeFormat;
    outputFormat: OutputFormat;
    estimatedDurationMinutes: number;
    notes: string;
}

export interface MediaTransferJob {
    id?: string;
    orderId: string | null;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    tapes: TapeItem[];
    tapeCount: number;
    totalEstimatedMinutes: number;
    quotedPrice: number | null;
    finalPrice: number | null;
    status: MediaTransferStatus;
    payment: {
        method: string;
        transactionId: string;
        status: string;
        paidAt: any | null;
    };
    returnShipping: {
        courier: string;
        trackingNumber: string;
        dispatchDate: any | null;
        deliveryDate: any | null;
    };
    createdAt?: any;
    updatedAt?: any;
}

// ─── Collection Reference ────────────────────────────────────────────
const mediaJobsCol = collection(db, 'mediaTransferJobs');

// ─── Supported Formats ───────────────────────────────────────────────
export const SUPPORTED_VIDEO_FORMATS: TapeFormat[] = [
    'VHS', 'VHS-C', 'Video8', 'Hi8', 'Digital8', 'MiniDV', 'Mini DVD',
];
export const SUPPORTED_AUDIO_FORMATS: TapeFormat[] = ['AudioCassette'];
export const MAX_AUDIO_DURATION_MINUTES = 60;

// ─── CRUD ────────────────────────────────────────────────────────────

/** Create a new media transfer job (public / quote request) */
export async function createMediaTransferJob(
    data: Omit<MediaTransferJob, 'id' | 'status' | 'payment' | 'returnShipping' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    const docRef = await addDoc(mediaJobsCol, {
        ...data,
        tapeCount: data.tapes.length,
        totalEstimatedMinutes: data.tapes.reduce((sum, t) => sum + t.estimatedDurationMinutes, 0),
        status: 'quote_requested' as MediaTransferStatus,
        payment: {
            method: 'paypal',
            transactionId: '',
            status: 'pending',
            paidAt: null,
        },
        returnShipping: {
            courier: 'Royal Mail',
            trackingNumber: '',
            dispatchDate: null,
            deliveryDate: null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/** Get a job by ID */
export async function getMediaTransferJobById(jobId: string): Promise<MediaTransferJob | null> {
    const snap = await getDoc(doc(db, 'mediaTransferJobs', jobId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as MediaTransferJob;
}

/** Get all jobs (admin) */
export async function getAllMediaTransferJobs(): Promise<MediaTransferJob[]> {
    const q = query(mediaJobsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MediaTransferJob));
}

/** Get jobs by status (admin filter) */
export async function getMediaTransferJobsByStatus(status: MediaTransferStatus): Promise<MediaTransferJob[]> {
    const q = query(mediaJobsCol, where('status', '==', status), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MediaTransferJob));
}

/** Get jobs by customer */
export async function getMediaTransferJobsByCustomer(customerId: string): Promise<MediaTransferJob[]> {
    const q = query(mediaJobsCol, where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MediaTransferJob));
}

// ─── Status Transitions ──────────────────────────────────────────────

/** Send quote to customer */
export async function sendQuote(jobId: string, quotedPrice: number): Promise<void> {
    await updateDoc(doc(db, 'mediaTransferJobs', jobId), {
        status: 'quote_sent',
        quotedPrice,
        updatedAt: serverTimestamp(),
    });
}

/** Customer confirms the quote */
export async function confirmQuote(jobId: string): Promise<void> {
    await updateDoc(doc(db, 'mediaTransferJobs', jobId), {
        status: 'customer_confirmed',
        updatedAt: serverTimestamp(),
    });
}

/** Mark media as received at store */
export async function markMediaReceived(jobId: string): Promise<void> {
    await updateDoc(doc(db, 'mediaTransferJobs', jobId), {
        status: 'media_received',
        updatedAt: serverTimestamp(),
    });
}

/** Start transfer process */
export async function startTransfer(jobId: string): Promise<void> {
    await updateDoc(doc(db, 'mediaTransferJobs', jobId), {
        status: 'in_transfer',
        updatedAt: serverTimestamp(),
    });
}

/** Mark transfer as completed */
export async function completeTransfer(jobId: string, finalPrice?: number): Promise<void> {
    const updates: Record<string, any> = {
        status: 'completed',
        updatedAt: serverTimestamp(),
    };
    if (finalPrice !== undefined) {
        updates.finalPrice = finalPrice;
    }
    await updateDoc(doc(db, 'mediaTransferJobs', jobId), updates);
}

/** Mark as invoiced (after PayPal payment) */
export async function markInvoiced(
    jobId: string,
    transactionId: string
): Promise<void> {
    await updateDoc(doc(db, 'mediaTransferJobs', jobId), {
        status: 'invoiced',
        'payment.transactionId': transactionId,
        'payment.status': 'completed',
        'payment.paidAt': serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

/** Mark as returned (shipped back via Royal Mail) */
export async function markReturned(
    jobId: string,
    trackingNumber: string
): Promise<void> {
    await updateDoc(doc(db, 'mediaTransferJobs', jobId), {
        status: 'returned',
        'returnShipping.trackingNumber': trackingNumber,
        'returnShipping.dispatchDate': serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

/** Update return delivery date */
export async function markReturnDelivered(jobId: string): Promise<void> {
    await updateDoc(doc(db, 'mediaTransferJobs', jobId), {
        'returnShipping.deliveryDate': serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}
