import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { createCmsContent, updateCmsContent, type CmsContent, type SectionType } from '../../services/cmsService';
import { toast } from 'sonner';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: CmsContent | null;
}

const SECTION_OPTIONS: { val: SectionType; label: string }[] = [
    { val: 'hero_banner', label: 'Hero Banner' },
    { val: 'promotions_banner', label: 'Promotions Banner' },
    { val: 'featured_products', label: 'Featured Products Section' },
    { val: 'latest_arrivals', label: 'Latest Arrivals Section' },
    { val: 'tv_experts', label: 'TV Experts Section' },
    { val: 'policy', label: 'Policy Block' },
];

export function CmsContentModal({ isOpen, onClose, onSuccess, initialData }: Props) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<Partial<CmsContent>>({
        sectionType: 'hero_banner',
        title: '',
        subtitle: '',
        description: '',
        ctaText: '',
        ctaLink: '',
        image: '',
        displayOrder: 0,
        isActive: true,
        metadata: {},
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setForm(initialData);
        } else if (isOpen) {
            setForm({
                sectionType: 'hero_banner',
                title: '',
                subtitle: '',
                description: '',
                ctaText: '',
                ctaLink: '',
                image: '',
                displayOrder: 0,
                isActive: true,
                metadata: {},
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSave = {
                sectionType: form.sectionType as SectionType,
                title: form.title || '',
                subtitle: form.subtitle || '',
                description: form.description || '',
                ctaText: form.ctaText || '',
                ctaLink: form.ctaLink || '',
                image: form.image || null,
                displayOrder: Number(form.displayOrder) || 0,
                isActive: Boolean(form.isActive),
                metadata: form.metadata || {},
            };

            if (initialData?.id) {
                await updateCmsContent(initialData.id, dataToSave);
                toast.success('Content updated successfully');
            } else {
                await createCmsContent(dataToSave);
                toast.success('Content created successfully');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error('Failed to save content', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Content Section' : 'Add Content Section'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <form id="cms-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Section Type & Active Status */}
                        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Type *
                                </label>
                                <select
                                    required
                                    value={form.sectionType}
                                    onChange={e => setForm({ ...form, sectionType: e.target.value as SectionType })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {SECTION_OPTIONS.map(opt => (
                                        <option key={opt.val} value={opt.val}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer mb-2">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Publish/Active</span>
                                </label>
                            </div>
                        </div>

                        {/* Content Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    required
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Welcome to Seba Digital"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={form.subtitle}
                                    onChange={e => setForm({ ...form, subtitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Optional secondary text"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Body Text</label>
                                <textarea
                                    rows={4}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Main paragraph text..."
                                />
                            </div>
                        </div>

                        {/* Images & Links */}
                        <div className="grid grid-cols-2 gap-4 pt-2 -mx-2 px-2 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={form.image || ''}
                                    onChange={e => setForm({ ...form, image: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.displayOrder}
                                    onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Lower numbers appear first</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text (CTA)</label>
                                <input
                                    type="text"
                                    value={form.ctaText}
                                    onChange={e => setForm({ ...form, ctaText: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Shop Now"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                                <input
                                    type="text"
                                    value={form.ctaLink}
                                    onChange={e => setForm({ ...form, ctaLink: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. /products/tvs"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p>Content updates are live immediately. Leaving the image URL blank will use the generic fallback image for that section type if applicable.</p>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="cms-form"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {initialData ? 'Save Changes' : 'Create Content'}
                    </button>
                </div>
            </div>
        </div>
    );
}
