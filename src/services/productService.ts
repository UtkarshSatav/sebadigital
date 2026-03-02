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
    limit,
    startAfter,
    serverTimestamp,
    writeBatch,
    DocumentSnapshot,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────
export interface ProductPricing {
    originalPrice: number;
    sellingPrice: number;
    vatRate: number;
    vatAmount: number;
    priceIncVat: number;
}

export interface ProductStock {
    quantity: number;
    status: 'in_stock' | 'out_of_stock' | 'low_stock';
    lowStockThreshold: number;
}

export interface ProductFlags {
    isFeatured: boolean;
    isBestSeller: boolean;
    isNewArrival: boolean;
    isOnSale: boolean;
    isPopular: boolean;
}

export interface Product {
    id?: string;
    title: string;
    description: string;
    sku: string;
    categoryId: string;
    categorySlug: string;
    brandId: string;
    brandName: string;
    pricing: ProductPricing;
    image: string;
    gallery: string[];
    rating: number;
    reviewCount: number;
    stock: ProductStock;
    flags: ProductFlags;
    badge: string | null;
    promotionIds: string[];
    isActive: boolean;
    createdAt?: any;
    updatedAt?: any;
}

export interface Category {
    id?: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    displayOrder: number;
    isActive: boolean;
    createdAt?: any;
    updatedAt?: any;
}

export interface Brand {
    id?: string;
    name: string;
    slug: string;
    logoUrl: string;
    isTrusted: boolean;
    isActive: boolean;
    createdAt?: any;
    updatedAt?: any;
}

// ─── Collection References ───────────────────────────────────────────
const productsCol = collection(db, 'products');
const categoriesCol = collection(db, 'categories');
const brandsCol = collection(db, 'brands');

// ─── Helper: Calculate VAT pricing ──────────────────────────────────
export function calculatePricing(
    originalPrice: number,
    sellingPrice: number,
    vatRate: number = 0.2
): ProductPricing {
    const vatAmount = parseFloat((sellingPrice * vatRate).toFixed(2));
    const priceIncVat = parseFloat((sellingPrice + vatAmount).toFixed(2));
    return { originalPrice, sellingPrice, vatRate, vatAmount, priceIncVat };
}

// ─── Products CRUD ───────────────────────────────────────────────────

/** Get all products (with optional filters) */
export async function getProducts(filters?: {
    categorySlug?: string;
    brandId?: string;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isOnSale?: boolean;
    isBestSeller?: boolean;
    isPopular?: boolean;
    isActive?: boolean;
    limitCount?: number;
    lastDoc?: DocumentSnapshot;
}): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
    const constraints: QueryConstraint[] = [];

    if (filters?.categorySlug) {
        constraints.push(where('categorySlug', '==', filters.categorySlug));
    }
    if (filters?.brandId) {
        constraints.push(where('brandId', '==', filters.brandId));
    }
    if (filters?.isFeatured !== undefined) {
        constraints.push(where('flags.isFeatured', '==', filters.isFeatured));
    }
    if (filters?.isNewArrival !== undefined) {
        constraints.push(where('flags.isNewArrival', '==', filters.isNewArrival));
    }
    if (filters?.isOnSale !== undefined) {
        constraints.push(where('flags.isOnSale', '==', filters.isOnSale));
    }
    if (filters?.isBestSeller !== undefined) {
        constraints.push(where('flags.isBestSeller', '==', filters.isBestSeller));
    }
    if (filters?.isPopular !== undefined) {
        constraints.push(where('flags.isPopular', '==', filters.isPopular));
    }
    if (filters?.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters?.limitCount) {
        constraints.push(limit(filters.limitCount));
    }
    if (filters?.lastDoc) {
        constraints.push(startAfter(filters.lastDoc));
    }

    const q = query(productsCol, ...constraints);
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { products, lastDoc: lastVisible };
}

/** Get a single product by ID */
export async function getProductById(productId: string): Promise<Product | null> {
    const snap = await getDoc(doc(db, 'products', productId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Product;
}

/** Create a new product */
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(productsCol, {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/** Update an existing product */
export async function updateProduct(productId: string, data: Partial<Product>): Promise<void> {
    await updateDoc(doc(db, 'products', productId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/** Delete a product */
export async function deleteProduct(productId: string): Promise<void> {
    await deleteDoc(doc(db, 'products', productId));
}

/** Bulk create products (for seeding / CSV import) */
export async function bulkCreateProducts(products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const batch = writeBatch(db);
    products.forEach((product) => {
        const ref = doc(productsCol);
        batch.set(ref, {
            ...product,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });
    await batch.commit();
}

/** Search products by title (client-side filter — for small catalogs) */
export async function searchProducts(searchTerm: string): Promise<Product[]> {
    const { products } = await getProducts({ isActive: true });
    const term = searchTerm.toLowerCase();
    return products.filter(
        (p) =>
            p.title.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.brandName.toLowerCase().includes(term)
    );
}

// ─── Categories CRUD ─────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
    const q = query(categoriesCol, where('isActive', '==', true), orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const q = query(categoriesCol, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as Category;
}

export async function createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(categoriesCol, {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateCategory(categoryId: string, data: Partial<Category>): Promise<void> {
    await updateDoc(doc(db, 'categories', categoryId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteCategory(categoryId: string): Promise<void> {
    await deleteDoc(doc(db, 'categories', categoryId));
}

// ─── Brands CRUD ─────────────────────────────────────────────────────

export async function getBrands(): Promise<Brand[]> {
    const q = query(brandsCol, where('isActive', '==', true), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Brand));
}

export async function getTrustedBrands(): Promise<Brand[]> {
    const q = query(brandsCol, where('isTrusted', '==', true), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Brand));
}

export async function createBrand(brand: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(brandsCol, {
        ...brand,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateBrand(brandId: string, data: Partial<Brand>): Promise<void> {
    await updateDoc(doc(db, 'brands', brandId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteBrand(brandId: string): Promise<void> {
    await deleteDoc(doc(db, 'brands', brandId));
}
