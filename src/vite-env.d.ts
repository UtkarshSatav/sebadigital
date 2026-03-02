/// <reference types="vite/client" />

interface ImportMetaEnv {
    // PayPal — public, safe for frontend
    readonly VITE_PAYPAL_CLIENT_ID: string;
    readonly VITE_PAYPAL_ENV: string;
    readonly VITE_PAYPAL_RECEIVER_EMAIL: string;
    // Firebase Functions base URL
    readonly VITE_FUNCTIONS_BASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
