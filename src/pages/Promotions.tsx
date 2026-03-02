import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Clock } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { getCmsContentByType, type CmsContent } from '../services/cmsService';
import { toast } from 'sonner';

export function Promotions() {
  const { addToCart } = useCart();
  const [cmsData, setCmsData] = useState<CmsContent | null>(null);

  useEffect(() => {
    getCmsContentByType('promotions_banner').then(setCmsData).catch(console.error);
  }, []);

  const saleProducts = products.filter(p => p.badge === 'SALE');
  const hotProducts = products.filter(p => p.badge === 'HOT');
  const newProducts = products.filter(p => p.badge === 'NEW');

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });
    toast.success('Item added to cart', {
      description: product.title,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block bg-white/20 px-4 py-2 rounded-full mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Limited Time Offers</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            {cmsData?.title || 'Amazing Promotions'}
          </h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto whitespace-pre-line">
            {cmsData?.description || "Don't miss out on our exclusive deals and discounts. Save big on premium electronics and appliances!"}
          </p>
        </div>
      </div>

      {/* Hot Deals */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Hot Deals</h2>
            <p className="text-gray-600">Our most popular items at unbeatable prices</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hotProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border-2 border-orange-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <div className="relative overflow-hidden bg-gray-100">
                <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold z-10">
                  HOT
                </div>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                  {product.title}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    £{product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    £{product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-orange-600">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sale Items */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Sale Items</h2>
              <p className="text-gray-600">Massive savings on selected products</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {saleProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border-2 border-red-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="relative overflow-hidden bg-gray-100">
                  <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold z-10">
                    SALE
                  </div>
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                    {product.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      £{product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      £{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-red-600">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">✨</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold">New Arrivals</h2>
            <p className="text-gray-600">Latest products with special introductory prices</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {newProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border-2 border-green-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <div className="relative overflow-hidden bg-gray-100">
                <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold z-10">
                  NEW
                </div>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                  {product.title}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    £{product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    £{product.originalPrice.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
