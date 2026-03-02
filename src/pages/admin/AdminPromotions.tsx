import { useEffect, useState } from 'react';
import { Tag, Plus, Percent, Calendar, Trash2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getAllPromotions, deletePromotion, updatePromotion, type Promotion } from '../../services/promotionService';
import { PromotionModal } from '../../components/admin/PromotionModal';
import { toast } from 'sonner';

export function AdminPromotions() {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Promotion | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => { loadPromos(); }, []);

    const loadPromos = async () => {
        try {
            setLoading(true);
            setPromos(await getAllPromotions());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this promotion?')) return;
        setDeleting(id);
        try {
            await deletePromotion(id);
            toast.success('Promotion deleted');
            loadPromos();
        } catch (e: any) { toast.error('Failed', { description: e.message }); }
        finally { setDeleting(null); }
    };

    const toggleActive = async (promo: Promotion) => {
        try {
            await updatePromotion(promo.id!, { isActive: !promo.isActive });
            toast.success(promo.isActive ? 'Deactivated' : 'Activated');
            loadPromos();
        } catch (e: any) { toast.error('Failed', { description: e.message }); }
    };

    const openCreate = () => { setEditing(null); setShowModal(true); };
    const openEdit = (p: Promotion) => { setEditing(p); setShowModal(true); };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage discounts and promo codes</p>
                </div>
                <button onClick={openCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Promotion
                </button>
            </div>

            {promos.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Promotions Yet</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                        Create promo codes with percentage or fixed discounts. Codes auto-apply at checkout.
                    </p>
                    <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-6">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <Percent className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">% off</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <Tag className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">£ off</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Date-limited</p>
                        </div>
                    </div>
                    <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
                        Create First Promotion
                    </button>
                </div>
            ) : (
                <div className="grid gap-3">
                    {promos.map(promo => (
                        <div key={promo.id}
                            className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${promo.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <Tag className={`w-6 h-6 ${promo.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{promo.title}</h3>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        {promo.promoCode && (
                                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-blue-600">{promo.promoCode}</code>
                                        )}
                                        <span className="text-sm text-gray-500">
                                            {promo.discountType === 'percentage' ? `${promo.discountValue}% off` : `£${promo.discountValue} off`}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Used {promo.usageCount}{promo.usageLimit ? `/${promo.usageLimit}` : ''} times
                                        </span>
                                        {promo.endDate && (
                                            <span className="text-xs text-gray-400">
                                                Ends {promo.endDate?.toDate?.()?.toLocaleDateString('en-GB') || '—'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => toggleActive(promo)}
                                    className={`p-2 rounded-lg transition-colors ${promo.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                    title={promo.isActive ? 'Deactivate' : 'Activate'}>
                                    {promo.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                </button>
                                <button onClick={() => openEdit(promo)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Edit">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(promo.id!)} disabled={deleting === promo.id}
                                    className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 disabled:opacity-50" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PromotionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSaved={loadPromos}
                editing={editing}
            />
        </div>
    );
}
