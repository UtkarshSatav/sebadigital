import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────
export interface DashboardOverview {
    todaysOrders: number;
    todaysRevenue: number;
    pendingShipments: number;
    returnsInProgress: number;
    pendingCollections: number;
    activeMediaJobs: number;
    totalCustomers: number;
    recentOrders: Array<{
        id: string;
        orderNumber: string;
        customerName: string;
        grandTotal: number;
        status: string;
        createdAt: any;
    }>;
}

// ─── Dashboard Aggregation Queries ───────────────────────────────────

/** Get comprehensive dashboard overview */
export async function getDashboardOverview(): Promise<DashboardOverview> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    // Run all queries in parallel for performance
    const [
        todaysOrdersSnap,
        pendingShipmentsSnap,
        returnsSnap,
        pendingCollectionsSnap,
        mediaJobsSnap,
        customersSnap,
        recentOrdersSnap,
    ] = await Promise.all([
        // Today's orders
        getDocs(
            query(
                collection(db, 'orders'),
                where('createdAt', '>=', todayTimestamp),
                orderBy('createdAt', 'desc')
            )
        ),
        // Pending shipments (paid but not dispatched, shipping method)
        getDocs(
            query(
                collection(db, 'orders'),
                where('status', 'in', ['paid', 'packed']),
                where('deliveryMethod', '==', 'shipping')
            )
        ),
        // Returns in progress
        getDocs(
            query(
                collection(db, 'returns'),
                where('status', 'in', ['requested', 'approved', 'received'])
            )
        ),
        // Pending click & collect
        getDocs(
            query(
                collection(db, 'orders'),
                where('deliveryMethod', '==', 'click_and_collect'),
                where('clickAndCollect.status', 'in', ['pending_collection', 'ready_for_collection'])
            )
        ),
        // Active media transfer jobs
        getDocs(
            query(
                collection(db, 'mediaTransferJobs'),
                where('status', 'in', ['quote_requested', 'quote_sent', 'customer_confirmed', 'media_received', 'in_transfer'])
            )
        ),
        // Total customers count
        getDocs(collection(db, 'customers')),
        // Recent orders (last 10)
        getDocs(
            query(
                collection(db, 'orders'),
                orderBy('createdAt', 'desc'),
                limit(10)
            )
        ),
    ]);

    // Calculate today's revenue
    let todaysRevenue = 0;
    todaysOrdersSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.pricing?.grandTotal) {
            todaysRevenue += data.pricing.grandTotal;
        }
    });

    // Map recent orders
    const recentOrders = recentOrdersSnap.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            orderNumber: data.orderNumber || '',
            customerName: data.customerName || '',
            grandTotal: data.pricing?.grandTotal || 0,
            status: data.status || '',
            createdAt: data.createdAt,
        };
    });

    return {
        todaysOrders: todaysOrdersSnap.size,
        todaysRevenue: parseFloat(todaysRevenue.toFixed(2)),
        pendingShipments: pendingShipmentsSnap.size,
        returnsInProgress: returnsSnap.size,
        pendingCollections: pendingCollectionsSnap.size,
        activeMediaJobs: mediaJobsSnap.size,
        totalCustomers: customersSnap.size,
        recentOrders,
    };
}

/** Get revenue for a date range */
export async function getRevenueByDateRange(
    startDate: Date,
    endDate: Date
): Promise<{ totalRevenue: number; orderCount: number }> {
    const q = query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        where('status', 'not-in', ['cancelled']),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    let totalRevenue = 0;
    snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.pricing?.grandTotal) {
            totalRevenue += data.pricing.grandTotal;
        }
    });

    return {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        orderCount: snapshot.size,
    };
}

/** Get orders by status breakdown */
export async function getOrderStatusBreakdown(): Promise<Record<string, number>> {
    const statuses = [
        'pending_payment', 'paid', 'packed', 'dispatched',
        'delivered', 'cancelled', 'refunded',
    ];

    const counts: Record<string, number> = {};

    await Promise.all(
        statuses.map(async (status) => {
            const q = query(collection(db, 'orders'), where('status', '==', status));
            const snapshot = await getDocs(q);
            counts[status] = snapshot.size;
        })
    );

    return counts;
}

/** Get top-selling products (based on order line items) */
export async function getTopSellingProducts(
    topN: number = 10
): Promise<Array<{ productId: string; title: string; totalQuantity: number; totalRevenue: number }>> {
    const q = query(
        collection(db, 'orders'),
        where('status', 'not-in', ['cancelled', 'refunded'])
    );
    const snapshot = await getDocs(q);

    const productMap = new Map<string, { title: string; totalQuantity: number; totalRevenue: number }>();

    snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.lineItems && Array.isArray(data.lineItems)) {
            data.lineItems.forEach((item: any) => {
                const existing = productMap.get(item.productId) || {
                    title: item.title,
                    totalQuantity: 0,
                    totalRevenue: 0,
                };
                existing.totalQuantity += item.quantity;
                existing.totalRevenue += item.lineTotalIncVat || item.lineTotal;
                productMap.set(item.productId, existing);
            });
        }
    });

    return Array.from(productMap.entries())
        .map(([productId, data]) => ({ productId, ...data }))
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, topN);
}
