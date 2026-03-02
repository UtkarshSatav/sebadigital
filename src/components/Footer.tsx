import { Facebook, Twitter, Instagram, MapPin, Phone, Mail, CreditCard } from 'lucide-react';
import { Link } from 'react-router';
import logo from '../assets/logo.jpg';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Seba Digital" className="h-10 w-auto" />
            </Link>
            <p className="text-sm mb-6">
              Your trusted electronics retailer in West Ealing, London. Quality products, expert advice, and unbeatable prices since 1990.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/promotions" className="hover:text-white transition-colors">Promotions</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">FAQs (Contact Us)</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-white mb-4">Newsletter</h3>
            <p className="text-sm mb-4">
              Subscribe for exclusive deals and product updates.
            </p>
            <div className="flex gap-2 mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 text-sm"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm">
                →
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>West Ealing, London</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>0208 567 8550</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>info@sebadigital.co.uk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div>
              © 2024 Seba Digital. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>We accept:</span>
              <div className="flex gap-2">
                <div className="bg-white px-3 py-1.5 rounded flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-gray-700" />
                  <span className="text-xs font-semibold text-gray-700">Visa</span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-gray-700" />
                  <span className="text-xs font-semibold text-gray-700">Mastercard</span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-gray-700" />
                  <span className="text-xs font-semibold text-gray-700">PayPal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}