import { useState, useEffect } from 'react';
import {
    Monitor,
    Save,
    RefreshCw,
    Eye,
    EyeOff,
    Edit3,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
    AlertCircle,
    Check,
    ExternalLink,
    Search,
    ShoppingBag,
    X,
} from 'lucide-react';
import {
    getAllCmsContent,
    updateCmsContent,
    createCmsContent,
    deleteCmsContent,
    type CmsContent,
    type SectionType,
} from '../../services/cmsService';
import { getProducts, type Product } from '../../services/productService';
import { toast } from 'sonner';

// ─── Section label map ────────────────────────────────────────────────────────
const SECTION_LABELS: Record<SectionType, string> = {
    hero_banner: '🏠 Hero Banner',
    promotions_banner: '🎉 Promotions Banner',
    featured_products: '⭐ Featured Products',
    latest_arrivals: '🆕 Latest Arrivals',
    tv_experts: '📺 TV Experts Section',
    policy: '📋 About / Policy Block',
};

const SECTION_TYPES: SectionType[] = [
    'hero_banner',
    'promotions_banner',
    'featured_products',
    'latest_arrivals',
    'tv_experts',
    'policy',
];

const PRODUCT_PICKER_SECTIONS: SectionType[] = ['featured_products', 'latest_arrivals'];

// ─── ProductPickerPanel ───────────────────────────────────────────────────────
function ProductPickerPanel({
    selectedIds,
    onChange,
}: {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}) {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // No isActive filter here — combining where() + orderBy() needs a composite
        // Firestore index that may not exist. Load all products and filter client-side.
        getProducts({ limitCount: 500 })
            .then(({ products }) => setAllProducts(products))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const term = search.toLowerCase();
    const filtered = !term
        ? allProducts
        : allProducts.filter(p =>
            p.title?.toLowerCase().includes(term) ||
            p.brandName?.toLowerCase().includes(term) ||
            p.categorySlug?.toLowerCase().includes(term) ||
            p.sku?.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term)
        );

    const toggle = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(s => s !== id));
        } else if (selectedIds.length < 4) {
            onChange([...selectedIds, id]);
        } else {
            toast.error('You can only select 4 products for this section');
        }
    };

    const removeSelected = (id: string) => onChange(selectedIds.filter(s => s !== id));
    const selectedProducts = allProducts.filter(p => selectedIds.includes(p.id!));

    return (
        <div className="space-y-4">
            {/* Selected slots */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Selected Products ({selectedIds.length}/4)
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => {
                        const p = selectedProducts[i];
                        return (
                            <div
                                key={i}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${p ? 'border-blue-200 bg-blue-50' : 'border-dashed border-gray-200 bg-gray-50'}`}
                            >
                                {p ? (
                                    <>
                                        {p.image ? (
                                            <img src={p.image} alt={p.title} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                <ShoppingBag className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                        <span className="flex-1 truncate font-medium text-gray-800">{p.title}</span>
                                        <button onClick={() => removeSelected(p.id!)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-gray-400 italic">Slot {i + 1} — empty</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Search + list */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Search & Add Products
                </label>
                <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or brand…"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-6 text-gray-400 text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1" />
                        Loading products…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-xs">No products found{search ? ` for "${search}"` : ''}</div>
                ) : (
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                        {filtered.slice(0, 50).map(p => {
                            const isSelected = selectedIds.includes(p.id!);
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => toggle(p.id!)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                >
                                    {p.image ? (
                                        <img src={p.image} alt={p.title} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            <ShoppingBag className="w-4 h-4 text-gray-300" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-800 truncate">{p.title}</p>
                                        <p className="text-xs text-gray-400">{p.brandName} · £{p.pricing?.sellingPrice?.toFixed(2)}</p>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                )}
                <p className="text-xs text-gray-400 mt-1">Showing max 50 results · Select exactly 4</p>
            </div>
        </div>
    );
}

// ─── Inline Section Editor ────────────────────────────────────────────────────
function SectionEditor({
    section,
    onSave,
    onDelete,
}: {
    section: CmsContent;
    onSave: (id: string, data: Partial<CmsContent>) => Promise<void>;
    onDelete: (id: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<Partial<CmsContent>>(section);
    const [dirty, setDirty] = useState(false);

    const upd = (k: keyof CmsContent, v: any) => {
        setForm(f => ({ ...f, [k]: v }));
        setDirty(true);
    };

    const updMeta = (key: string, value: any) => {
        setForm(f => ({ ...f, metadata: { ...(f.metadata || {}), [key]: value } }));
        setDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(section.id!, form);
            setDirty(false);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setForm(section);
        setDirty(false);
    };

    const isProductSection = PRODUCT_PICKER_SECTIONS.includes(section.sectionType);
    const selectedProductIds: string[] = (form.metadata?.productIds as string[]) || [];

    return (
        <div className={`bg-white rounded-xl border-2 transition-colors ${expanded ? 'border-blue-200' : 'border-gray-100'} shadow-sm`}>
            {/* Header Row */}
            <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
                onClick={() => setExpanded(e => !e)}
            >
                <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-gray-800">
                        {SECTION_LABELS[section.sectionType] ?? section.sectionType}
                    </span>
                    {dirty && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            Unsaved changes
                        </span>
                    )}
                    {isProductSection && selectedProductIds.length > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            {selectedProductIds.length}/4 products selected
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); upd('isActive', !form.isActive); }}
                        title={form.isActive ? 'Published' : 'Hidden'}
                        className={`p-1.5 rounded-lg transition-colors ${form.isActive
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        {form.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    {expanded
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                </div>
            </div>

            {expanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
                    {/* ── Product Picker (featured_products / latest_arrivals) ── */}
                    {isProductSection && (
                        <div className="pt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                Select Products to Display
                            </h4>
                            <ProductPickerPanel
                                selectedIds={selectedProductIds}
                                onChange={ids => updMeta('productIds', ids)}
                            />
                        </div>
                    )}

                    {/* Section heading fields */}
                    <div className={isProductSection ? '' : 'pt-4'}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Section Heading / Title
                        </label>
                        <input
                            type="text"
                            value={form.title ?? ''}
                            onChange={e => upd('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Section title shown on the page"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subtitle</label>
                        <input
                            type="text"
                            value={form.subtitle ?? ''}
                            onChange={e => upd('subtitle', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Secondary line of text"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Body / Description</label>
                        <textarea
                            rows={3}
                            value={form.description ?? ''}
                            onChange={e => upd('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Main paragraph or body text…"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Button Text</label>
                            <input
                                type="text"
                                value={form.ctaText ?? ''}
                                onChange={e => upd('ctaText', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. View All Products"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Button Link</label>
                            <input
                                type="text"
                                value={form.ctaLink ?? ''}
                                onChange={e => upd('ctaLink', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="/products/tvs"
                            />
                        </div>
                    </div>
                    {!isProductSection && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Image URL</label>
                            <input
                                type="url"
                                value={form.image ?? ''}
                                onChange={e => upd('image', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://..."
                            />
                            {form.image && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-gray-100 h-28 bg-gray-50">
                                    <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Display Order</label>
                        <input
                            type="number"
                            min={0}
                            value={form.displayOrder ?? 0}
                            onChange={e => upd('displayOrder', parseInt(e.target.value) || 0)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Lower numbers appear first.</p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => onDelete(section.id!)}
                            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove section
                        </button>
                        <div className="flex gap-2">
                            {dirty && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                                >
                                    Discard
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || !dirty}
                                className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                            >
                                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page Editor ─────────────────────────────────────────────────────────
export function AdminPageEditor() {
    const [sections, setSections] = useState<CmsContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingType, setAddingType] = useState<SectionType | ''>('');
    const [adding, setAdding] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getAllCmsContent();
            setSections(data);
        } catch (e: any) {
            toast.error('Failed to load page sections', { description: e.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (id: string, data: Partial<CmsContent>) => {
        await updateCmsContent(id, data);
        toast.success('Section updated!');
        await load();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this content section? This cannot be undone.')) return;
        await deleteCmsContent(id);
        toast.success('Section removed');
        await load();
    };

    const handleAddSection = async () => {
        if (!addingType) return;
        setAdding(true);
        try {
            await createCmsContent({
                sectionType: addingType as SectionType,
                title: '',
                subtitle: '',
                description: '',
                ctaText: '',
                ctaLink: '',
                image: null,
                displayOrder: sections.length,
                isActive: true,
                metadata: {},
            });
            toast.success('Section created!');
            setAddingType('');
            await load();
        } catch (e: any) {
            toast.error('Failed to create section', { description: e.message });
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Page Editor</h1>
                        <p className="text-sm text-gray-500">Edit visible content sections of your website</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Preview Site
                    </a>
                    <button
                        onClick={load}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-medium mb-0.5">Changes are live immediately</p>
                    <p className="text-blue-600">
                        Click a section to expand and edit. For <strong>Featured Products</strong> and <strong>Latest Arrivals</strong>, use the product picker to choose which products to display.
                    </p>
                </div>
            </div>

            {/* Add new section */}
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-4">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-500" />
                    Add a New Section
                </p>
                <div className="flex gap-3">
                    <select
                        value={addingType}
                        onChange={e => setAddingType(e.target.value as SectionType | '')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">— Choose section type —</option>
                        {SECTION_TYPES.map(t => (
                            <option key={t} value={t}>{SECTION_LABELS[t]}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAddSection}
                        disabled={!addingType || adding}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        {adding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add
                    </button>
                </div>
            </div>

            {/* Section List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    <p className="text-sm">Loading page sections…</p>
                </div>
            ) : sections.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <Edit3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-700 mb-1">No sections yet</h3>
                    <p className="text-sm text-gray-400">Use the panel above to add your first content section.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sections
                        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                        .map(section => (
                            <SectionEditor
                                key={section.id}
                                section={section}
                                onSave={handleSave}
                                onDelete={handleDelete}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}
