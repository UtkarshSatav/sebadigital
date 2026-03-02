import { useEffect, useState } from 'react';
import { Settings, Save, Store, Clock, CreditCard, Percent, Truck, AlertCircle } from 'lucide-react';
import { getSettings, updateSettings } from '../../services/settingsService';
import { toast } from 'sonner';

interface GlobalSettings {
    vatRate: number;
    currency: string;
    shippingFee: number;
    freeShippingThreshold: number;
    storeInfo: {
        storeName: string;
        address: string;
        phone: string;
        email: string;
        clickAndCollectEnabled: boolean;
    };
    operatingHours: { day: string; open: string; close: string; isClosed: boolean }[];
    paypal: { clientId: string; environment: string };
}

export function AdminSettings() {
    const [settings, setSettings] = useState<GlobalSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getSettings();
            setSettings(data as any);
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        try {
            setSaving(true);
            await updateSettings(settings as any);
            toast.success('Settings saved successfully');
        } catch (err: any) {
            toast.error('Failed to save settings', { description: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600">Failed to load settings</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Global store configuration</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Store Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Store className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                            <input
                                type="text"
                                value={settings.storeInfo?.storeName || ''}
                                onChange={(e) => setSettings({ ...settings, storeInfo: { ...settings.storeInfo, storeName: e.target.value } })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={settings.storeInfo?.address || ''}
                                onChange={(e) => setSettings({ ...settings, storeInfo: { ...settings.storeInfo, address: e.target.value } })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={settings.storeInfo?.phone || ''}
                                    onChange={(e) => setSettings({ ...settings, storeInfo: { ...settings.storeInfo, phone: e.target.value } })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="text"
                                    value={settings.storeInfo?.email || ''}
                                    onChange={(e) => setSettings({ ...settings, storeInfo: { ...settings.storeInfo, email: e.target.value } })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.storeInfo?.clickAndCollectEnabled ?? true}
                                onChange={(e) => setSettings({ ...settings, storeInfo: { ...settings.storeInfo, clickAndCollectEnabled: e.target.checked } })}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Enable Click & Collect</span>
                        </label>
                    </div>
                </div>

                {/* Tax & Shipping */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Percent className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Tax & Shipping</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">VAT Rate (%)</label>
                                <input
                                    type="number"
                                    value={(settings.vatRate || 0.2) * 100}
                                    onChange={(e) => setSettings({ ...settings, vatRate: parseFloat(e.target.value) / 100 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                <input
                                    type="text"
                                    value={settings.currency || 'GBP'}
                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Fee (£)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={settings.shippingFee || 4.99}
                                    onChange={(e) => setSettings({ ...settings, shippingFee: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Over (£)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={settings.freeShippingThreshold || 50}
                                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operating Hours */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Operating Hours</h2>
                    </div>
                    {settings.operatingHours?.length > 0 ? (
                        <div className="space-y-2">
                            {settings.operatingHours.map((h, i) => (
                                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                                    <span className="font-medium text-gray-900 w-24">{h.day}</span>
                                    {h.isClosed ? (
                                        <span className="text-red-500 font-medium">Closed</span>
                                    ) : (
                                        <span className="text-gray-600">{h.open} — {h.close}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No operating hours configured</p>
                    )}
                </div>

                {/* PayPal Configuration */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">PayPal Configuration</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                            <input
                                type="text"
                                value={settings.paypal?.clientId || ''}
                                onChange={(e) => setSettings({ ...settings, paypal: { ...settings.paypal, clientId: e.target.value } })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono text-xs"
                                placeholder="PayPal Client ID"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                            <select
                                value={settings.paypal?.environment || 'sandbox'}
                                onChange={(e) => setSettings({ ...settings, paypal: { ...settings.paypal, environment: e.target.value } })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="sandbox">Sandbox</option>
                                <option value="production">Production</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
