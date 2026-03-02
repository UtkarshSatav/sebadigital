import { ShoppingCart, Phone, Menu, X, ChevronDown, User, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useAuth } from '../contexts/AuthContext';
import { CartDrawer } from './CartDrawer';
import { MegaMenu } from './MegaMenu';
import logo from '../assets/logo.jpg';

export function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const { getCartCount } = useCart();
  const { customer } = useCustomerAuth();
  const { isAdmin, adminProfile } = useAuth();
  const cartCount = getCartCount();

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Seba Digital" className="h-10 w-auto" />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                // onMouseLeave={() => setIsMegaMenuOpen(false)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                Shop by Category
                <ChevronDown className={`w-4 h-4 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 text-sm">About Us</Link>
              <Link to="/promotions" className="text-gray-700 hover:text-blue-600 text-sm">Promotions</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 text-sm">Contact Us</Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span className="text-sm hidden lg:inline">0208 567 8550</span>
              </div>
              {/* Account Button */}
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">{adminProfile?.displayName?.split(' ')[0] ?? 'Admin'}</span>
                </Link>
              ) : customer ? (
                <Link
                  to="/account/profile"
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {customer.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{customer.firstName}</span>
                </Link>
              ) : (
                <Link
                  to="/account"
                  className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium flex items-center gap-2 relative"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-700"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3">
              <Link to="/products/tvs" className="text-gray-700 hover:text-blue-600 text-sm py-2">TVs</Link>
              <Link to="/products/cameras" className="text-gray-700 hover:text-blue-600 text-sm py-2">Cameras</Link>
              <Link to="/products/entertainment" className="text-gray-700 hover:text-blue-600 text-sm py-2">Entertainment</Link>
              <Link to="/products/appliances" className="text-gray-700 hover:text-blue-600 text-sm py-2">Appliances</Link>
              <Link to="/products/phones" className="text-gray-700 hover:text-blue-600 text-sm py-2">Phones</Link>
              <Link to="/products/headphones" className="text-gray-700 hover:text-blue-600 text-sm py-2">Headphones</Link>
              <Link to="/products/accessories" className="text-gray-700 hover:text-blue-600 text-sm py-2">Accessories</Link>
              <div className="border-t border-gray-200 my-2"></div>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 text-sm py-2">About Us</Link>
              <Link to="/promotions" className="text-gray-700 hover:text-blue-600 text-sm py-2">Promotions</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 text-sm py-2">Contact Us</Link>
            </nav>
          )}
        </div>

        {/* Mega Menu */}
        {isMegaMenuOpen && (
          <div
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <MegaMenu onClose={() => setIsMegaMenuOpen(false)} />
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}