import { useState } from 'react';
import { X, Tag, Save } from 'lucide-react';
import { createPromotion, updatePromotion, type Promotion } from '../../services/promotionService';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface PromotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editing?: Promotion | null;
}

export function PromotionModal({ isOpen, onClose, onSaved, editing }: PromotionModalProps) {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: editing?.title || '',
        description: editing?.description || '',
        promoCode: editing?.promoCode || '',
        discountType: editing?.discountType || 'percentage' as 'percentage' | 'fixed',
        discountValue: editing?.discountValue?.toString() || '',
        startDate: editing?.startDate?.toDate?.()?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10),
        endDate: editing?.endDate?.toDate?.()?.toISOString().slice(0, 10) || '',
        usageLimit: editing?.usageLimit?.toString() || '',
        isActive: editing?.isActive ?? true,
    });

    const upd = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.discountValue || !form.endDate) {
            toast.error('Title, discount value, and end date are required');
            return;
        }
        try {
            setSaving(true);
            const payload = {
                title: form.title,
                description: form.description,
                promoCode: form.promoCode || null,
                discountType: form.discountType,
                discountValue: parseFloat(form.discountValue),
                applicableTo: { categoryIds: [], brandIds: [], productIds: [] },
                startDate: Timestamp.fromDate(new Date(form.startDate)),
                endDate: Timestamp.fromDate(new Date(form.endDate)),
                usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
                isActive: form.isActive,
                bannerImage: null,
            };
            if (editing?.id) {
                await updatePromotion(editing.id, payload);
                toast.success('Promotion updated');
            } else {
                await createPromotion(payload);
                toast.success('Promotion created');
            }
            onSaved();
            onClose();
        } catch (e: any) {
            toast.error('Failed', { description: e.message });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Promotion' : 'Create Promotion'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input type="text" value={form.title} onChange={e => upd('title', e.target.value)} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g. Summer Sale 20% Off" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => upd('description', e.target.value)} rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            placeholder="Optional promo description..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
                        <input type="text" value={form.promoCode} onChange={e => upd('promoCode', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono uppercase"
                            placeholder="e.g. SUMMER20 (leave blank for auto-apply)" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                            <select value={form.discountType} onChange={e => upd('discountType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (£)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Value {form.discountType === 'percentage' ? '(%)' : '(£)'} *
                            </label>
                            <input type="number" step="0.01" value={form.discountValue} onChange={e => upd('discountValue', e.target.value)} required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="e.g. 20" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input type="date" value={form.startDate} onChange={e => upd('startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                            <input type="date" value={form.endDate} onChange={e => upd('endDate', e.target.value)} required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (optional)</label>
                        <input type="number" value={form.usageLimit} onChange={e => upd('usageLimit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Leave blank for unlimited" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isActive} onChange={e => upd('isActive', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm text-gray-700">Active (visible to customers)</span>
                    </label>
                </form>
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </>
    );
}
