/**
 * Seba Digital OMS — Seed Script
 *
 * Run this ONCE from the browser console or a temporary page to populate
 * Firestore with initial data: categories, brands, settings, CMS content,
 * and all 50 existing products (migrated from products.js).
 *
 * Usage:
 *   import { seedAll } from './services/seedFirestore';
 *   seedAll();
 */

import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { calculatePricing } from './productService';
import { products as staticProducts } from '../data/products';

// ─── Seed Categories ─────────────────────────────────────────────────
const CATEGORIES = [
    { slug: 'tvs', name: 'TVs', description: 'Premium televisions from top brands', displayOrder: 1 },
    { slug: 'cameras', name: 'Cameras', description: 'Professional and consumer cameras', displayOrder: 2 },
    { slug: 'entertainment', name: 'Entertainment', description: 'Soundbars, speakers, gaming and streaming', displayOrder: 3 },
    { slug: 'appliances', name: 'Appliances', description: 'Kitchen and home appliances', displayOrder: 4 },
    { slug: 'phones', name: 'Phones', description: 'Smartphones and mobile devices', displayOrder: 5 },
    { slug: 'headphones', name: 'Headphones', description: 'Premium headphones and earbuds', displayOrder: 6 },
    { slug: 'accessories', name: 'Accessories', description: 'Cases, chargers, cables and more', displayOrder: 7 },
    { slug: 'media', name: 'Media', description: 'Blank media, batteries, brackets, cables and leads', displayOrder: 8 },
];

async function seedCategories(): Promise<void> {
    const batch = writeBatch(db);
    CATEGORIES.forEach((cat) => {
        const ref = doc(db, 'categories', `cat_${cat.slug}`);
        batch.set(ref, {
            ...cat,
            image: '',
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });
    await batch.commit();
    console.log(`✅ Seeded ${CATEGORIES.length} categories`);
}

// ─── Seed Brands ─────────────────────────────────────────────────────
const BRANDS = [
    'TDK', 'Panasonic', 'Philips', 'Sony', 'JVC',
    'Maxell', 'Memorex', 'Verbatim', 'Nexis', 'Kingston',
];

async function seedBrands(): Promise<void> {
    const batch = writeBatch(db);
    BRANDS.forEach((name) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        const ref = doc(db, 'brands', `brand_${slug}`);
        batch.set(ref, {
            name,
            slug,
            logoUrl: '',
            isTrusted: true,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });
    await batch.commit();
    console.log(`✅ Seeded ${BRANDS.length} brands`);
}

// ─── Seed Global Settings ────────────────────────────────────────────
async function seedSettings(): Promise<void> {
    await setDoc(doc(db, 'settings', 'global'), {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    console.log('✅ Seeded global settings');
}

// ─── Seed CMS Content ────────────────────────────────────────────────
const CMS_SECTIONS = [
    {
        id: 'hero_banner',
        sectionType: 'hero_banner',
        title: 'Premium Electronics',
        subtitle: 'Family-Run Since 1990',
        description: 'Your trusted local electronics retailer in West Ealing, London. Over 30 years of expert service.',
        ctaText: 'Shop Now',
        ctaLink: '/products/tvs',
        displayOrder: 1,
    },
    {
        id: 'tv_experts',
        sectionType: 'tv_experts',
        title: 'TV Specialists',
        subtitle: 'Expert Advice on Premium Televisions',
        description: 'From OLED to QLED, our specialists help you find the perfect TV for your home.',
        ctaText: 'Browse TVs',
        ctaLink: '/products/tvs',
        displayOrder: 2,
    },
    {
        id: 'special_promotions',
        sectionType: 'promotions_banner',
        title: 'Special Offers',
        subtitle: 'Limited Time Deals',
        description: 'Check out our latest promotions on premium electronics.',
        ctaText: 'View Promotions',
        ctaLink: '/promotions',
        displayOrder: 3,
    },
    {
        id: 'featured_products',
        sectionType: 'featured_products',
        title: 'Featured Products',
        subtitle: 'Hand-Picked by Our Experts',
        description: 'Discover our curated selection of premium electronics.',
        ctaText: 'View All',
        ctaLink: '/products/tvs',
        displayOrder: 4,
    },
    {
        id: 'latest_arrivals',
        sectionType: 'latest_arrivals',
        title: 'Latest Arrivals',
        subtitle: 'Fresh In Store',
        description: 'Be the first to get our newest products.',
        ctaText: 'View New Arrivals',
        ctaLink: '/products/tvs',
        displayOrder: 5,
    },
];

async function seedCmsContent(): Promise<void> {
    const batch = writeBatch(db);
    CMS_SECTIONS.forEach((section) => {
        const ref = doc(db, 'cmsContent', section.id);
        batch.set(ref, {
            ...section,
            image: null,
            isActive: true,
            metadata: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });
    await batch.commit();
    console.log(`✅ Seeded ${CMS_SECTIONS.length} CMS sections`);
}

// ─── Seed Products (migrate from static products.js) ─────────────────
function inferBrand(title: string): string {
    const brands: Record<string, string> = {
        samsung: 'brand_samsung',
        lg: 'brand_lg',
        sony: 'brand_sony',
        panasonic: 'brand_panasonic',
        philips: 'brand_philips',
        canon: 'brand_canon',
        nikon: 'brand_nikon',
        fujifilm: 'brand_fujifilm',
        gopro: 'brand_gopro',
        dji: 'brand_dji',
        apple: 'brand_apple',
        google: 'brand_google',
        oneplus: 'brand_oneplus',
        motorola: 'brand_motorola',
        bose: 'brand_bose',
        jbl: 'brand_jbl',
        marshall: 'brand_marshall',
        sennheiser: 'brand_sennheiser',
        beats: 'brand_beats',
        steelseries: 'brand_steelseries',
        logitech: 'brand_logitech',
        anker: 'brand_anker',
        belkin: 'brand_belkin',
        otterbox: 'brand_otterbox',
        spigen: 'brand_spigen',
        rain: 'brand_rain-design',
        ninja: 'brand_ninja',
        breville: 'brand_breville',
        irobot: 'brand_irobot',
        vitamix: 'brand_vitamix',
        instant: 'brand_instant-pot',
        dyson: 'brand_dyson',
        tcl: 'brand_tcl',
        hisense: 'brand_hisense',
        sonos: 'brand_sonos',
        'audio-technica': 'brand_audio-technica',
    };

    const titleLower = title.toLowerCase();
    for (const [key, value] of Object.entries(brands)) {
        if (titleLower.startsWith(key) || titleLower.includes(key)) {
            return value;
        }
    }
    return '';
}

function inferBrandName(title: string): string {
    const firstWord = title.split(' ')[0];
    // Handle multi-word brands
    if (title.toLowerCase().startsWith('audio-technica')) return 'Audio-Technica';
    if (title.toLowerCase().startsWith('instant pot')) return 'Instant Pot';
    if (title.toLowerCase().startsWith('rain design')) return 'Rain Design';
    return firstWord;
}

function badgeToFlags(badge?: string): {
    isFeatured: boolean;
    isBestSeller: boolean;
    isNewArrival: boolean;
    isOnSale: boolean;
    isPopular: boolean;
} {
    return {
        isFeatured: badge === 'HOT',
        isBestSeller: badge === 'HOT',
        isNewArrival: badge === 'NEW',
        isOnSale: badge === 'SALE',
        isPopular: badge === 'HOT' || badge === 'SALE',
    };
}

async function seedProducts(): Promise<void> {
    // Firestore writeBatch limit = 500 ops, but we only have 50 products
    const batch = writeBatch(db);

    staticProducts.forEach((p: any) => {
        const ref = doc(db, 'products', `prod_${String(p.id).padStart(3, '0')}`);
        const pricing = calculatePricing(p.originalPrice || p.price, p.price, 0.2);
        const flags = badgeToFlags(p.badge);

        batch.set(ref, {
            title: p.title,
            description: p.title, // Use title as placeholder description
            sku: `SEB-${p.category.toUpperCase()}-${String(p.id).padStart(3, '0')}`,
            categoryId: `cat_${p.category}`,
            categorySlug: p.category,
            brandId: inferBrand(p.title),
            brandName: inferBrandName(p.title),
            pricing,
            image: p.image,
            gallery: p.gallery || [p.image],
            rating: p.rating || 0,
            reviewCount: p.reviews || 0,
            stock: {
                quantity: Math.floor(Math.random() * 50) + 5,
                status: 'in_stock',
                lowStockThreshold: 5,
            },
            flags,
            badge: p.badge || null,
            promotionIds: [],
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });

    await batch.commit();
    console.log(`✅ Seeded ${staticProducts.length} products`);
}

// ─── Seed All ────────────────────────────────────────────────────────
export async function seedAll(): Promise<void> {
    console.log('🌱 Starting Seba Digital OMS seed...');
    try {
        await seedCategories();
        await seedBrands();
        await seedSettings();
        await seedCmsContent();
        await seedProducts();
        console.log('🎉 All seed data written to Firestore!');
    } catch (error) {
        console.error('❌ Seed error:', error);
        throw error;
    }
}

// Export individual seeders for selective use
export {
    seedCategories,
    seedBrands,
    seedSettings,
    seedCmsContent,
    seedProducts,
};
