import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── CMS Content Types ───────────────────────────────────────────────
export type SectionType =
    | 'hero_banner'
    | 'tv_experts'
    | 'promotions_banner'
    | 'featured_products'
    | 'latest_arrivals'
    | 'policy';

export interface CmsContent {
    id?: string;
    sectionType: SectionType;
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    image: string | null;
    displayOrder: number;
    isActive: boolean;
    metadata: Record<string, any>;
    createdAt?: any;
    updatedAt?: any;
}

// ─── Testimonial Types ───────────────────────────────────────────────
export interface Testimonial {
    id?: string;
    customerName: string;
    customerId: string | null;
    quote: string;
    rating: number;
    isVerifiedCustomer: boolean;
    displayOrder: number;
    isActive: boolean;
    createdAt?: any;
    updatedAt?: any;
}

// ─── Newsletter Types ────────────────────────────────────────────────
export interface NewsletterSubscriber {
    id?: string;
    email: string;
    consentTimestamp: any;
    sourcePage: string;
    isActive: boolean;
    unsubscribedAt: any | null;
    createdAt?: any;
}

// ─── Collection References ───────────────────────────────────────────
const cmsCol = collection(db, 'cmsContent');
const testimonialsCol = collection(db, 'testimonials');
const newsletterCol = collection(db, 'newsletterSubscribers');

// ─── CMS Content CRUD ────────────────────────────────────────────────

export async function getCmsContentByType(sectionType: SectionType): Promise<CmsContent | null> {
    const q = query(cmsCol, where('sectionType', '==', sectionType), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as CmsContent;
}

export async function getAllCmsContent(): Promise<CmsContent[]> {
    const q = query(cmsCol, orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CmsContent));
}

export async function getActiveCmsContent(): Promise<CmsContent[]> {
    const q = query(cmsCol, where('isActive', '==', true), orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CmsContent));
}

export async function createCmsContent(
    content: Omit<CmsContent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    const docRef = await addDoc(cmsCol, {
        ...content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateCmsContent(contentId: string, data: Partial<CmsContent>): Promise<void> {
    await updateDoc(doc(db, 'cmsContent', contentId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteCmsContent(contentId: string): Promise<void> {
    await deleteDoc(doc(db, 'cmsContent', contentId));
}

// ─── Testimonials CRUD ───────────────────────────────────────────────

export async function getActiveTestimonials(): Promise<Testimonial[]> {
    const q = query(
        testimonialsCol,
        where('isActive', '==', true),
        orderBy('displayOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Testimonial));
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
    const q = query(testimonialsCol, orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Testimonial));
}

export async function createTestimonial(
    data: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    const docRef = await addDoc(testimonialsCol, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateTestimonial(testimonialId: string, data: Partial<Testimonial>): Promise<void> {
    await updateDoc(doc(db, 'testimonials', testimonialId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteTestimonial(testimonialId: string): Promise<void> {
    await deleteDoc(doc(db, 'testimonials', testimonialId));
}

// ─── Newsletter CRUD ─────────────────────────────────────────────────

export async function subscribeToNewsletter(email: string, sourcePage: string): Promise<string> {
    // Check if already subscribed
    const q = query(newsletterCol, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const existing = snapshot.docs[0];
        // Reactivate if previously unsubscribed
        await updateDoc(doc(db, 'newsletterSubscribers', existing.id), {
            isActive: true,
            unsubscribedAt: null,
            consentTimestamp: serverTimestamp(),
            sourcePage,
        });
        return existing.id;
    }

    const docRef = await addDoc(newsletterCol, {
        email,
        consentTimestamp: serverTimestamp(),
        sourcePage,
        isActive: true,
        unsubscribedAt: null,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function unsubscribeFromNewsletter(email: string): Promise<void> {
    const q = query(newsletterCol, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    await updateDoc(doc(db, 'newsletterSubscribers', snapshot.docs[0].id), {
        isActive: false,
        unsubscribedAt: serverTimestamp(),
    });
}

export async function getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    const q = query(newsletterCol, where('isActive', '==', true), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NewsletterSubscriber));
}

export async function getAllSubscribers(): Promise<NewsletterSubscriber[]> {
    const q = query(newsletterCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NewsletterSubscriber));
}
