import { useEffect, useState } from 'react';
import { Users, Search, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { verifyCustomer } from '../../services/customerService';
import { toast } from 'sonner';

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isVerified: boolean;
    orderStats: { totalOrders: number; totalSpent: number };
    createdAt: any;
}

export function AdminCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [verifying, setVerifying] = useState<string | null>(null);

    const handleVerify = async (id: string) => {
        setVerifying(id);
        try {
            await verifyCustomer(id);
            toast.success('Customer verified');
            loadCustomers();
        } catch (e: any) { toast.error('Failed', { description: e.message }); }
        finally { setVerifying(null); }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setCustomers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Customer)));
        } catch (err) {
            console.error('Failed to load customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = searchTerm
        ? customers.filter(c =>
            `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : customers;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                <p className="text-gray-500 text-sm mt-1">{customers.length} registered customers</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 mb-6 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search customers by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {customers.length === 0 ? (
                /* Empty state */
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Customers Yet</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                        Customer profiles are created automatically when users register at{' '}
                        <span className="text-blue-600 font-medium">/account</span> or place an order.
                    </p>
                </div>
            ) : (
                /* Table */
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Customer</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Contact</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Orders</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Total Spent</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Joined</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                                                    {customer.firstName?.[0]}{customer.lastName?.[0]}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-xs text-gray-500"><Mail className="w-3 h-3" />{customer.email}</div>
                                                {customer.phone && <div className="flex items-center gap-1 text-xs text-gray-500"><Phone className="w-3 h-3" />{customer.phone}</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{customer.orderStats?.totalOrders || 0}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-gray-900">£{(customer.orderStats?.totalSpent || 0).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${customer.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {customer.isVerified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">
                                                {customer.createdAt?.toDate?.() ? customer.createdAt.toDate().toLocaleDateString('en-GB') : '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.isVerified ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                                </span>
                                            ) : (
                                                <button onClick={() => handleVerify(customer.id)}
                                                    disabled={verifying === customer.id}
                                                    className="px-3 py-1 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50">
                                                    {verifying === customer.id ? 'Verifying...' : 'Verify'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
