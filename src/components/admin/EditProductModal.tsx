import { X, Package } from 'lucide-react';
import { updateProduct, deleteProduct, calculatePricing, type Product } from '../../services/productService';
import { toast } from 'sonner';
import { useState } from 'react';

interface EditProductModalProps {
    product: Product;
    onClose: () => void;
    onSaved: () => void;
}

const CATEGORIES = ['tvs', 'audio', 'headphones', 'media', 'cables', 'accessories', 'batteries', 'computing'];

export function EditProductModal({ product, onClose, onSaved }: EditProductModalProps) {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: product.title,
        description: product.description,
        sku: product.sku,
        categorySlug: product.categorySlug,
        brandName: product.brandName,
        sellingPrice: product.pricing?.sellingPrice?.toString() || '',
        originalPrice: product.pricing?.originalPrice?.toString() || '',
        image: product.image,
        stockQuantity: product.stock?.quantity?.toString() || '0',
        badge: product.badge || '',
        isFeatured: product.flags?.isFeatured || false,
        isBestSeller: product.flags?.isBestSeller || false,
        isNewArrival: product.flags?.isNewArrival || false,
        isOnSale: product.flags?.isOnSale || false,
        isActive: product.isActive,
    });

    const upd = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        if (!form.title || !form.sellingPrice) { toast.error('Title and price are required'); return; }
        try {
            setSaving(true);
            const sellingPrice = parseFloat(form.sellingPrice);
            const originalPrice = parseFloat(form.originalPrice) || sellingPrice;
            const pricing = calculatePricing(originalPrice, sellingPrice, 0.2);
            const qty = parseInt(form.stockQuantity) || 0;
            await updateProduct(product.id!, {
                title: form.title,
                description: form.description,
                sku: form.sku,
                categorySlug: form.categorySlug,
                brandName: form.brandName,
                pricing,
                image: form.image,
                stock: {
                    quantity: qty,
                    status: qty > 10 ? 'in_stock' : qty > 0 ? 'low_stock' : 'out_of_stock',
                    lowStockThreshold: 5,
                },
                flags: {
                    isFeatured: form.isFeatured,
                    isBestSeller: form.isBestSeller,
                    isNewArrival: form.isNewArrival,
                    isOnSale: form.isOnSale,
                    isPopular: product.flags?.isPopular || false,
                },
                badge: form.badge || null,
                isActive: form.isActive,
            });
            toast.success('Product updated!');
            onSaved();
            onClose();
        } catch (e: any) { toast.error('Failed', { description: e.message }); }
        finally { setSaving(false); }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input type="text" value={form.title} onChange={e => upd('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => upd('description', e.target.value)} rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input type="text" value={form.sku} onChange={e => upd('sku', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select value={form.categorySlug} onChange={e => upd('categorySlug', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                        <input type="text" value={form.brandName} onChange={e => upd('brandName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (£) *</label>
                            <input type="number" step="0.01" value={form.sellingPrice} onChange={e => upd('sellingPrice', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (£)</label>
                            <input type="number" step="0.01" value={form.originalPrice} onChange={e => upd('originalPrice', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input type="text" value={form.image} onChange={e => upd('image', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
                            <input type="number" value={form.stockQuantity} onChange={e => upd('stockQuantity', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                        <div className="flex gap-2 flex-wrap">
                            {['', 'SALE', 'HOT', 'NEW', 'BEST SELLER'].map(b => (
                                <button key={b} type="button" onClick={() => upd('badge', b)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.badge === b ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                                    {b || 'None'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {[['isFeatured', 'Featured'], ['isBestSeller', 'Best Seller'], ['isNewArrival', 'New Arrival'], ['isOnSale', 'On Sale'], ['isActive', 'Active']].map(([k, label]) => (
                            <label key={k} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={(form as any)[k]} onChange={e => upd(k, e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                                <span className="text-sm text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSave} disabled={saving}
                        className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </>
    );
}
