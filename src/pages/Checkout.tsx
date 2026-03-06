import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  Lock,
  Truck,
  Store,
  Package,
  Clock,
  ChevronLeft,
  Info,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { createOrder, calculateLineItem, calculateOrderPricing, getShippingFee } from '../services/orderService';
import { PayPalProvider, PayPalCheckoutButtons } from '../services/paypalService';
import { getProductById } from '../services/productService';

type DeliveryMethod = 'standard' | 'nextday' | 'collect';

export function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMethod = searchParams.get('method') === 'collect' ? 'collect' : 'standard';
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(initialMethod);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postcode: '',
    phone: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [readyToPay, setReadyToPay] = useState(false);

  const subtotal = getCartTotal();
  const deliveryFee = deliveryMethod === 'nextday' ? 4.99 : 0;
  const returnShippingFee = cart.length === 1 ? 3.49 : 0;
  const total = subtotal + deliveryFee;

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validates the form before showing PayPal buttons
  const handleProceedToPayment = async () => {
    if (!formData.email || !formData.phone) {
      toast.error('Please fill in your contact information');
      return;
    }
    if (deliveryMethod !== 'collect' && (!formData.firstName || !formData.lastName)) {
      toast.error('Please fill in your name');
      return;
    }
    if (deliveryMethod !== 'collect' && (!formData.address || !formData.city || !formData.postcode)) {
      toast.error('Please fill in your shipping address');
      return;
    }
    if (!agreeToTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    // Final inventory check before payment
    try {
      const stockChecks = await Promise.all(cart.map(item => getProductById(String(item.id))));
      const outOfStockItems: string[] = [];

      for (let i = 0; i < cart.length; i++) {
        const product = stockChecks[i];
        const cartItem = cart[i];

        if (!product || product.stock?.status === 'out_of_stock' || (product.stock?.quantity ?? 0) < cartItem.quantity) {
          outOfStockItems.push(cartItem.title);
        }
      }

      if (outOfStockItems.length > 0) {
        toast.error('Some items in your cart are no longer available in the requested quantity', {
          description: `Restocking Soon: ${outOfStockItems.join(', ')}`
        });
        return;
      }
    } catch (err) {
      console.error('Stock verification failed', err);
      toast.error('Unable to verify stock levels. Please try again.');
      return;
    }

    setReadyToPay(true);
  };

  // Called by PayPal after successful payment
  const handlePayPalSuccess = async (transactionId: string, payerEmail: string) => {
    if (cart.length === 0) { toast.error('Your cart is empty'); return; }
    try {
      const lineItems = cart.map(item => {
        const lineCalc = calculateLineItem(item.price, item.quantity, 0.2);
        return {
          productId: String(item.id),
          title: item.title,
          sku: '',
          image: item.image,
          unitPrice: item.price,
          quantity: item.quantity,
          vatRate: 0.2,
          ...lineCalc,
        };
      });

      const shippingFee = deliveryMethod === 'nextday' ? 4.99 : getShippingFee(subtotal);
      const pricing = calculateOrderPricing(lineItems, shippingFee);

      const orderId = await createOrder({
        orderNumber: `SEB-${Date.now().toString(36).toUpperCase()}`,
        customerId: null,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        status: 'paid',
        lineItems,
        pricing,
        payment: {
          method: 'paypal',
          status: 'completed',
          transactionId,
          paidAt: null,
        },
        deliveryMethod: deliveryMethod === 'collect' ? 'click_and_collect' : 'shipping',
        shippingAddress: deliveryMethod !== 'collect' ? {
          line1: formData.address,
          city: formData.city,
          postcode: formData.postcode,
          country: 'GB',
        } : null,
        shippingStatus: deliveryMethod !== 'collect' ? { status: 'pending' } : null,
        clickAndCollect: deliveryMethod === 'collect' ? {
          status: 'pending_collection',
          storeAddress: 'Seba Digital, West Ealing, London',
          readyAt: null,
          collectedAt: null,
        } : null,
        discountCode: null,
        notes: '',
      } as any);

      toast.success('Payment successful! Order confirmed.', {
        description: `Order #${orderId.slice(-6).toUpperCase()} confirmed · PayPal ref: ${transactionId.slice(-8)}`,
      });
      clearCart();
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      toast.error('Order creation failed', { description: err.message });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to checkout</p>
          <Link
            to="/products/tvs"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to shopping
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Method</h2>

              <div className="space-y-3">
                {/* Standard Delivery */}
                <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${deliveryMethod === 'standard' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="standard"
                    checked={deliveryMethod === 'standard'}
                    onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Standard Delivery</span>
                      <span className="text-green-600 font-semibold ml-auto">FREE</span>
                    </div>
                    <p className="text-sm text-gray-600">3-5 working days</p>
                  </div>
                </label>

                {/* Next Day Delivery */}
                <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${deliveryMethod === 'nextday' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="nextday"
                    checked={deliveryMethod === 'nextday'}
                    onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Next Day Delivery</span>
                      <span className="text-gray-900 font-semibold ml-auto">£4.99</span>
                    </div>
                    <p className="text-sm text-gray-600">Order before 2:00pm on a working day</p>
                  </div>
                </label>

                {/* Click & Collect */}
                <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${deliveryMethod === 'collect' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="collect"
                    checked={deliveryMethod === 'collect'}
                    onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Store className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Click & Collect</span>
                      <span className="text-green-600 font-semibold ml-auto">FREE</span>
                    </div>
                    <p className="text-sm text-gray-600">Collect from our store</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">Mon–Fri 9am–6pm • Sat 9am–5pm</p>
                  </div>
                </label>
              </div>

              {/* Store Info Notice */}
              {deliveryMethod === 'collect' && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-900">
                    <p className="font-semibold mb-1">Seba Digital — West Ealing, London</p>
                    <p>Your order will be ready for collection. We'll notify you by email when it's ready to pick up.</p>
                  </div>
                </div>
              )}

              {/* Delivery Info Notice */}
              {deliveryMethod !== 'collect' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Delivery Information</p>
                    <p>Free delivery on orders over £50. We deliver across the UK mainland.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="07XXX XXXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {deliveryMethod !== 'collect' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Street address"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postcode
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment — PayPal Smart Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                Payment
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Secure checkout powered by PayPal. You can pay with your PayPal account or any debit/credit card.
              </p>

              {!readyToPay ? (
                <button
                  onClick={handleProceedToPayment}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Proceed to Payment — £{total.toFixed(2)}
                </button>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">Details confirmed. Complete payment below.</span>
                  </div>
                  <PayPalProvider>
                    <PayPalCheckoutButtons
                      orderDetails={{
                        amount: total,
                        orderDescription: `Seba Digital Order — ${itemCount} item(s)`,
                        items: cart.map(item => ({
                          name: item.title,
                          quantity: item.quantity,
                          unitAmount: item.price,
                        })),
                        shippingAddress: deliveryMethod !== 'collect' ? {
                          line1: formData.address,
                          city: formData.city,
                          postcode: formData.postcode,
                          country: 'GB',
                        } : undefined,
                      }}
                      onSuccess={handlePayPalSuccess}
                      onError={(err) => {
                        toast.error('Payment failed', { description: err?.message || 'Please try again' });
                        setReadyToPay(false);
                      }}
                    />
                  </PayPalProvider>
                  <button onClick={() => setReadyToPay(false)}
                    className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-700">
                    ← Back to edit details
                  </button>
                </div>
              )}

              {/* Trust signals */}
              <div className="mt-5 flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
                <img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-medium.png"
                  alt="Pay with PayPal" className="h-6 object-contain" />
                <span className="text-xs text-gray-400">or debit/credit card via PayPal</span>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600"
                  required
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/contact" className="text-blue-600 hover:underline">
                    terms and conditions
                  </Link>{' '}
                  and have read the return policy
                </span>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-semibold">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold">{deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">£{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Return Shipping: </span>
                  {cart.length > 1 ? 'Free via Royal Mail Tracked (2+ items)' : `£${returnShippingFee.toFixed(2)} via Royal Mail Tracked`}
                </p>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900">
                  <span className="font-semibold">Transfer to DVD Services:</span><br />
                  For VHS to DVD, Audio Cassette to CD and other transfer services,{' '}
                  <Link to="/contact" className="underline font-semibold">contact us</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
