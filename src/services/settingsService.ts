import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────
export interface StoreInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
    operatingHours: Record<string, string>;
    clickAndCollectEnabled: boolean;
}

export interface GlobalSettings {
    vatRate: number;
    currency: string;
    currencySymbol: string;
    freeShippingThreshold: number;
    standardShippingFee: number;
    store: StoreInfo;
    supportedRegions: string[];
    paypal: {
        clientId: string;
        environment: 'sandbox' | 'production';
    };
    createdAt?: any;
    updatedAt?: any;
}

// ─── Settings Document Path ──────────────────────────────────────────
const SETTINGS_DOC = doc(db, 'settings', 'global');

// ─── Default Settings ────────────────────────────────────────────────
const DEFAULT_SETTINGS: Omit<GlobalSettings, 'createdAt' | 'updatedAt'> = {
    vatRate: 0.2,
    currency: 'GBP',
    currencySymbol: '£',
    freeShippingThreshold: 50,
    standardShippingFee: 4.99,
    store: {
        name: 'Seba Digital',
        address: 'West Ealing, London',
        phone: '',
        email: '',
        operatingHours: {
            monday: '9:00 AM – 6:00 PM',
            tuesday: '9:00 AM – 6:00 PM',
            wednesday: '9:00 AM – 6:00 PM',
            thursday: '9:00 AM – 6:00 PM',
            friday: '9:00 AM – 6:00 PM',
            saturday: '9:00 AM – 5:00 PM',
            sunday: 'Closed',
        },
        clickAndCollectEnabled: true,
    },
    supportedRegions: ['GB'],
    paypal: {
        clientId: '',
        environment: 'sandbox',
    },
};

// ─── Settings CRUD ───────────────────────────────────────────────────

/** Get global settings (returns defaults if not yet configured) */
export async function getSettings(): Promise<GlobalSettings> {
    const snap = await getDoc(SETTINGS_DOC);
    if (!snap.exists()) {
        return { ...DEFAULT_SETTINGS } as GlobalSettings;
    }
    return snap.data() as GlobalSettings;
}

/** Initialize settings (call once during setup) */
export async function initializeSettings(): Promise<void> {
    const snap = await getDoc(SETTINGS_DOC);
    if (!snap.exists()) {
        await setDoc(SETTINGS_DOC, {
            ...DEFAULT_SETTINGS,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
}

/** Update settings (partial update) */
export async function updateSettings(data: Partial<GlobalSettings>): Promise<void> {
    await updateDoc(SETTINGS_DOC, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/** Update store info specifically */
export async function updateStoreInfo(storeInfo: Partial<StoreInfo>): Promise<void> {
    const updates: Record<string, any> = { updatedAt: serverTimestamp() };
    Object.entries(storeInfo).forEach(([key, value]) => {
        updates[`store.${key}`] = value;
    });
    await updateDoc(SETTINGS_DOC, updates);
}

/** Update PayPal config */
export async function updatePayPalConfig(
    clientId: string,
    environment: 'sandbox' | 'production'
): Promise<void> {
    await updateDoc(SETTINGS_DOC, {
        'paypal.clientId': clientId,
        'paypal.environment': environment,
        updatedAt: serverTimestamp(),
    });
}

/** Get the current VAT rate */
export async function getVatRate(): Promise<number> {
    const settings = await getSettings();
    return settings.vatRate;
}

/** Get shipping config */
export async function getShippingConfig(): Promise<{
    freeShippingThreshold: number;
    standardShippingFee: number;
}> {
    const settings = await getSettings();
    return {
        freeShippingThreshold: settings.freeShippingThreshold,
        standardShippingFee: settings.standardShippingFee,
    };
}
