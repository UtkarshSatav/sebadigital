import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </CartProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}