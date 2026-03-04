import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AboutUs } from './pages/AboutUs';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Promotions } from './pages/Promotions';
import { ContactUs } from './pages/ContactUs';
import { Checkout } from './pages/Checkout';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { RefundPolicy } from './pages/RefundPolicy';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminPromotions } from './pages/admin/AdminPromotions';
import { AdminShipping } from './pages/admin/AdminShipping';
import { AdminReturns } from './pages/admin/AdminReturns';
import { AdminMediaTransfers } from './pages/admin/AdminMediaTransfers';
import { AdminCms } from './pages/admin/AdminCms';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminPageEditor } from './pages/admin/AdminPageEditor';

import { CustomerLogin } from './pages/CustomerLogin';
import { CustomerProfile } from './pages/CustomerProfile';
import { TrackOrder } from './pages/TrackOrder';
import { CustomerForgotPassword } from './pages/CustomerForgotPassword';

export const router = createBrowserRouter([
  // ─── Storefront Routes ─────────────────────────
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'about', Component: AboutUs },
      { path: 'products/:category', Component: Products },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'promotions', Component: Promotions },
      { path: 'contact', Component: ContactUs },
      { path: 'checkout', Component: Checkout },
      { path: 'privacy', Component: PrivacyPolicy },
      { path: 'terms', Component: TermsOfService },
      { path: 'refund-policy', Component: RefundPolicy },
    ],
  },
  // ─── Customer Account ───────────────────────────────────────────────────────
  {
    path: '/account',
    Component: CustomerLogin,
  },
  {
    path: '/account/forgot-password',
    Component: CustomerForgotPassword,
  },
  // ─── Customer Profile (authenticated) ─────────────────────────────────────
  {
    path: '/account/profile',
    Component: CustomerProfile,
  },
  {
    path: '/account/profile/info',
    Component: CustomerProfile,
  },
  {
    path: '/account/profile/addresses',
    Component: CustomerProfile,
  },
  {
    path: '/account/profile/track',
    Component: CustomerProfile,
  },
  // ─── Track Order (public — no login required) ──────────────────────────────
  {
    path: '/account/track-order',
    Component: TrackOrder,
  },
  // ─── Admin Login (public) ──────────────────────
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
  // ─── Admin Dashboard (protected) ───────────────
  {
    path: '/admin',
    lazy: async () => {
      const { AdminLayout } = await import('./components/AdminLayout');
      const { ProtectedRoute } = await import('./components/ProtectedRoute');
      return {
        Component: () => (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
      };
    },
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'products', Component: AdminProducts },
      { path: 'orders', Component: AdminOrders },
      { path: 'customers', Component: AdminCustomers },
      { path: 'promotions', Component: AdminPromotions },
      { path: 'shipping', Component: AdminShipping },
      { path: 'returns', Component: AdminReturns },
      { path: 'media-transfers', Component: AdminMediaTransfers },
      { path: 'cms', Component: AdminCms },
      { path: 'page-editor', Component: AdminPageEditor },
      { path: 'settings', Component: AdminSettings },
    ],
  },
]);