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
} from 'lucide-react';
import {
    getAllCmsContent,
    updateCmsContent,
    createCmsContent,
    deleteCmsContent,
    type CmsContent,
    type SectionType,
} from '../../services/cmsService';
import { toast } from 'sonner';

// ─── Section label map ────────────────────────────────────────────────────────
const SECTION_LABELS: Record<SectionType, string> = {
    hero_banner: '🏠 Hero Banner',
    promotions_banner: '🎉 Promotions Banner',
    featured_products: '⭐ Featured Products',
    latest_arrivals: '🆕 Latest Arrivals',
    tv_experts: '📺 TV Experts Section',
    policy: '📋 Policy Block',
};

const SECTION_TYPES: SectionType[] = [
    'hero_banner',
    'promotions_banner',
    'featured_products',
    'latest_arrivals',
    'tv_experts',
    'policy',
];

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
                </div>
                <div className="flex items-center gap-2">
                    {/* Active toggle */}
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
                    {/* Title */}
                    <div className="pt-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Heading / Title</label>
                        <input
                            type="text"
                            value={form.title ?? ''}
                            onChange={e => upd('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Main heading text"
                        />
                    </div>
                    {/* Subtitle */}
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
                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Body / Description</label>
                        <textarea
                            rows={4}
                            value={form.description ?? ''}
                            onChange={e => upd('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Main paragraph or body text…"
                        />
                    </div>
                    {/* CTA + Link */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Button Text</label>
                            <input
                                type="text"
                                value={form.ctaText ?? ''}
                                onChange={e => upd('ctaText', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Shop Now"
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
                    {/* Image URL */}
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
                    {/* Display Order */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Display Order</label>
                        <input
                            type="number"
                            min={0}
                            value={form.displayOrder ?? 0}
                            onChange={e => upd('displayOrder', parseInt(e.target.value) || 0)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Lower numbers appear first on the page.</p>
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
                                {saving ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Check className="w-3.5 h-3.5" />
                                )}
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
                title: 'New Section',
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
                    <p className="text-blue-600">Click a section panel to expand and edit. Press <strong>Save</strong> on each section to publish your changes.</p>
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
