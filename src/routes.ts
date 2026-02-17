import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AboutUs } from './pages/AboutUs';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Promotions } from './pages/Promotions';
import { ContactUs } from './pages/ContactUs';
import { Checkout } from './pages/Checkout';

export const router = createBrowserRouter([
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
    ],
  },
]);