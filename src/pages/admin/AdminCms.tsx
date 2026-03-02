import { useEffect, useState } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, AlertCircle, Newspaper, MessageSquare } from 'lucide-react';
import { getAllCmsContent, getAllTestimonials, getAllSubscribers, deleteCmsContent, type CmsContent } from '../../services/cmsService';
import { CmsContentModal } from '../../components/admin/CmsContentModal';
import { toast } from 'sonner';

// using CmsContent from cmsService instead

interface Testimonial {
    id: string;
    customerName: string;
    rating: number;
    text: string;
    isApproved: boolean;
}

export function AdminCms() {
    const [content, setContent] = useState<CmsContent[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'content' | 'testimonials' | 'newsletter'>('content');

    // Modal state
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<CmsContent | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [cms, testis, subs] = await Promise.all([
                getAllCmsContent(),
                getAllTestimonials(),
                getAllSubscribers(),
            ]);
            setContent(cms as any);
            setTestimonials(testis as any);
            setSubscriberCount(subs.length);
        } catch (err) {
            console.error('Failed to load CMS data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContent = async (id: string, title: string) => {
        if (!confirm(`Delete content section "${title}"?`)) return;
        try {
            await deleteCmsContent(id);
            toast.success('Content deleted');
            loadData();
        } catch (e: any) {
            toast.error('Failed to delete', { description: e.message });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">CMS Content</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage website content, testimonials, and newsletter</p>
                </div>
                <button
                    onClick={() => { setEditingContent(null); setIsContentModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Content
                </button>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{content.length}</p>
                        <p className="text-xs text-gray-500">Content Sections</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
                        <p className="text-xs text-gray-500">Testimonials</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{subscriberCount}</p>
                        <p className="text-xs text-gray-500">Newsletter Subscribers</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
                {(['content', 'testimonials', 'newsletter'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {content.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {content.map((item) => (
                                <div key={item.id} className="p-5 flex items-center justify-between hover:bg-gray-50">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">Section: {item.sectionType}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {item.isActive ? 'Active' : 'Draft'}
                                        </span>
                                        <div className="flex gap-1">
                                            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Eye className="w-4 h-4" /></button>
                                            <button
                                                onClick={() => { setEditingContent(item); setIsContentModalOpen(true); }}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteContent(item.id!, item.title)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No CMS content yet</p>
                        </div>
                    )}
                </div>
            )}

            {/* Testimonials Tab */}
            {activeTab === 'testimonials' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    {testimonials.length > 0 ? (
                        <div className="space-y-4">
                            {testimonials.map((t) => (
                                <div key={t.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">{t.customerName}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {t.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex gap-0.5 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`text-lg ${i < t.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600">{t.text}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No testimonials yet</p>
                            <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                <span className="text-sm text-amber-700 font-medium">Endpoint ready — awaiting customer reviews</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Newsletter Tab */}
            {activeTab === 'newsletter' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="text-center py-8">
                        <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-2xl font-bold text-gray-900 mb-1">{subscriberCount}</p>
                        <p className="text-gray-500 mb-4">Total subscribers</p>
                        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span className="text-sm text-amber-700 font-medium">Endpoint ready — subscriber list export & email campaigns for future development</span>
                        </div>
                    </div>
                </div>
            )}

            <CmsContentModal
                isOpen={isContentModalOpen}
                onClose={() => setIsContentModalOpen(false)}
                onSuccess={loadData}
                initialData={editingContent}
            />
        </div>
    );
}
