import { useState } from 'react';
import { X, Package, Save } from 'lucide-react';
import { createProduct, calculatePricing, type Product } from '../../services/productService';
import { toast } from 'sonner';
import { ImageUploader } from './ImageUploader';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductAdded: () => void;
}

const CATEGORIES = [
    'tvs', 'audio', 'headphones', 'media', 'cables', 'accessories', 'batteries', 'computing', 'blank-media',
];

export function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        sku: '',
        categorySlug: 'audio',
        brandName: '',
        originalPrice: '',
        sellingPrice: '',
        image: '',
        stockQuantity: '50',
        badge: '',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false,
        isOnSale: false,
    });

    const updateField = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.sellingPrice) {
            toast.error('Title and Selling Price are required');
            return;
        }

        try {
            setSaving(true);
            const originalPrice = parseFloat(form.originalPrice) || parseFloat(form.sellingPrice);
            const sellingPrice = parseFloat(form.sellingPrice);
            const pricing = calculatePricing(originalPrice, sellingPrice, 0.2);
            const stockQty = parseInt(form.stockQuantity) || 50;

            const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
                title: form.title,
                description: form.description || `Premium ${form.title} from Seba Digital.`,
                sku: form.sku || `SEB-${Date.now().toString(36).toUpperCase()}`,
                categoryId: '',
                categorySlug: form.categorySlug,
                brandId: '',
                brandName: form.brandName || 'Generic',
                pricing,
                image: form.image || '/placeholder.jpg',
                gallery: form.image ? [form.image] : [],
                rating: 4.5,
                reviewCount: 0,
                stock: {
                    quantity: stockQty,
                    status: stockQty > 10 ? 'in_stock' : stockQty > 0 ? 'low_stock' : 'out_of_stock',
                    lowStockThreshold: 5,
                },
                flags: {
                    isFeatured: form.isFeatured,
                    isBestSeller: form.isBestSeller,
                    isNewArrival: form.isNewArrival,
                    isOnSale: form.isOnSale,
                    isPopular: false,
                },
                badge: form.badge || null,
                promotionIds: [],
                isActive: true,
            };

            await createProduct(product);
            toast.success('Product created!', { description: form.title });
            setForm({
                title: '', description: '', sku: '', categorySlug: 'audio', brandName: '',
                originalPrice: '', sellingPrice: '', image: '', stockQuantity: '50', badge: '',
                isFeatured: false, isBestSeller: false, isNewArrival: false, isOnSale: false,
            });
            onProductAdded();
            onClose();
        } catch (err: any) {
            toast.error('Failed to create product', { description: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Add New Product</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
                        <input
                            type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            placeholder="Product description..."
                        />
                    </div>

                    {/* SKU + Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input
                                type="text" value={form.sku} onChange={(e) => updateField('sku', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                placeholder="Auto-generated if empty"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={form.categorySlug} onChange={(e) => updateField('categorySlug', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Brand */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                        <input
                            type="text" value={form.brandName} onChange={(e) => updateField('brandName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g. Sony, Panasonic, JVC"
                        />
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (£) *</label>
                            <input
                                type="number" step="0.01" value={form.sellingPrice} onChange={(e) => updateField('sellingPrice', e.target.value)} required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="29.99"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (£)</label>
                            <input
                                type="number" step="0.01" value={form.originalPrice} onChange={(e) => updateField('originalPrice', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="39.99 (for strikethrough)"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                        <ImageUploader value={form.image} onChange={(url) => updateField('image', url)} folder="products" />
                    </div>

                    {/* Stock */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                        <input
                            type="number" value={form.stockQuantity} onChange={(e) => updateField('stockQuantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {/* Badge */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                        <div className="flex gap-2">
                            {['', 'SALE', 'HOT', 'NEW', 'BEST SELLER'].map((b) => (
                                <button
                                    type="button" key={b}
                                    onClick={() => updateField('badge', b)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.badge === b
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    {b || 'None'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Flags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Flags</label>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { key: 'isFeatured', label: 'Featured' },
                                { key: 'isBestSeller', label: 'Best Seller' },
                                { key: 'isNewArrival', label: 'New Arrival' },
                                { key: 'isOnSale', label: 'On Sale' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox" checked={(form as any)[key]}
                                        onChange={(e) => updateField(key, e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </div>
        </>
    );
}
