import { useEffect, useState } from 'react';
import { Package, Search, Plus, Edit, Trash2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { getProducts, deleteProduct, type Product as ServiceProduct } from '../../services/productService';
import { AddProductModal } from '../../components/admin/AddProductModal';
import { BulkCsvImport } from '../../components/admin/BulkCsvImport';
import { EditProductModal } from '../../components/admin/EditProductModal';
import { toast } from 'sonner';

interface Product {
    id?: string;
    title: string;
    sku: string;
    categorySlug: string;
    brandName: string;
    pricing: { sellingPrice: number; originalPrice: number };
    stock: { quantity: number; status: string };
    badge: string | null;
    image: string;
    isActive: boolean;
}

export function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCsvImport, setShowCsvImport] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => { loadProducts(); }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const result = await getProducts({ limitCount: 100 });
            setProducts(result.products as any);
        } catch (err) {
            console.error('Failed to load products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await deleteProduct(id);
            toast.success('Product deleted');
            loadProducts();
        } catch (e: any) {
            toast.error('Failed to delete', { description: e.message });
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = searchTerm
        ? products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
        : products;

    const getStockBadge = (status: string) => {
        const styles: Record<string, string> = {
            in_stock: 'bg-green-100 text-green-700',
            low_stock: 'bg-yellow-100 text-yellow-700',
            out_of_stock: 'bg-red-100 text-red-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 text-sm mt-1">{products.length} products in catalog</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCsvImport(true)}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Import CSV
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 mb-6">
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Product</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">SKU</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Category</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Price</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Stock</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Badge</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={p.image} alt={p.title}
                                                className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=IMG'; }} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{p.title}</p>
                                                <p className="text-xs text-gray-500">{p.brandName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{p.sku}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 capitalize">{p.categorySlug}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-gray-900">£{p.pricing?.sellingPrice?.toFixed(2)}</span>
                                        {p.pricing?.originalPrice > p.pricing?.sellingPrice && (
                                            <span className="text-xs text-gray-400 line-through ml-1">£{p.pricing.originalPrice.toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStockBadge(p.stock?.status)}`}>
                                            {p.stock?.status?.replace(/_/g, ' ')} ({p.stock?.quantity})
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.badge ? (
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${p.badge === 'SALE' ? 'bg-red-100 text-red-700' :
                                                    p.badge === 'HOT' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>{p.badge}</span>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setEditingProduct(p)}
                                                className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"
                                                title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id!, p.title)}
                                                disabled={deletingId === p.id}
                                                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="p-12 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No products found</p>
                    </div>
                )}
            </div>

            <AddProductModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onProductAdded={loadProducts} />
            <BulkCsvImport isOpen={showCsvImport} onClose={() => setShowCsvImport(false)} onImportComplete={loadProducts} />
            {editingProduct && (
                <EditProductModal
                    product={editingProduct as ServiceProduct}
                    onClose={() => setEditingProduct(null)}
                    onSaved={loadProducts}
                />
            )}
        </>
    );
}
