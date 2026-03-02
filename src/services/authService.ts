import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────
export interface AdminUser {
    uid: string;
    email: string;
    displayName: string;
    role: 'admin' | 'staff';
    createdAt?: any;
}

// ─── Auth Functions ──────────────────────────────────────────────────

/** Sign in with email and password */
export async function signIn(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

/** Sign out */
export async function logOut(): Promise<void> {
    await signOut(auth);
}

/** Get the current user */
export function getCurrentUser(): User | null {
    return auth.currentUser;
}

/** Listen for auth state changes */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

// ─── Admin Role Management ───────────────────────────────────────────

/** Check if a user is an admin */
export async function isAdmin(uid: string): Promise<boolean> {
    const snap = await getDoc(doc(db, 'adminUsers', uid));
    if (!snap.exists()) return false;
    return snap.data().role === 'admin';
}

/** Check if a user is staff or admin */
export async function isStaffOrAdmin(uid: string): Promise<boolean> {
    const snap = await getDoc(doc(db, 'adminUsers', uid));
    if (!snap.exists()) return false;
    return ['admin', 'staff'].includes(snap.data().role);
}

/** Get admin user profile */
export async function getAdminProfile(uid: string): Promise<AdminUser | null> {
    const snap = await getDoc(doc(db, 'adminUsers', uid));
    if (!snap.exists()) return null;
    return { uid: snap.id, ...snap.data() } as AdminUser;
}

/** Create an admin user record (call after Auth user is created) */
export async function createAdminUser(
    uid: string,
    email: string,
    displayName: string,
    role: 'admin' | 'staff' = 'admin'
): Promise<void> {
    await setDoc(doc(db, 'adminUsers', uid), {
        email,
        displayName,
        role,
        createdAt: serverTimestamp(),
    });
}

/** Register a new admin (creates Auth user + Firestore record) */
export async function registerAdmin(
    email: string,
    password: string,
    displayName: string,
    role: 'admin' | 'staff' = 'admin'
): Promise<User> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await createAdminUser(credential.user.uid, email, displayName, role);
    return credential.user;
}

/**
 * Auth guard helper — use in components to check admin access.
 * Returns the admin profile if authenticated and authorized, null otherwise.
 */
export async function checkAdminAccess(): Promise<AdminUser | null> {
    const user = getCurrentUser();
    if (!user) return null;
    return getAdminProfile(user.uid);
}

// ─── Customer Auth ───────────────────────────────────────────────────

/**
 * Register a new storefront customer.
 * Creates a Firebase Auth user + a Firestore customer document using the UID as doc ID.
 */
export async function registerCustomer(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string = ''
): Promise<User> {
    const { createCustomer } = await import('./customerService');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;
    const emptyAddress = { line1: '', line2: '', city: '', county: '', postcode: '', country: 'GB' };
    await createCustomer(uid, {
        firstName,
        lastName,
        email,
        phone,
        isVerified: false,
        isNewsletterSubscribed: false,
        newsletterConsentAt: null,
        shippingAddress: emptyAddress,
        billingAddress: emptyAddress,
    });
    return credential.user;
}

/** Sign in an existing customer */
export async function signInCustomer(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

/** Send Password Reset Email */
export async function resetCustomerPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
}

