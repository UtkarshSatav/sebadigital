import { useState } from 'react';
import { Star, ShoppingCart, Store } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router';
import { products } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

export function Products() {
  const { category } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const filteredProducts = category
    ? products.filter(p => p.category === category)
    : products;

  const categoryTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'All Products';

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

  const handleCollectAtStore = (product: any) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });
    toast.success('Item added — Click & Collect selected', {
      description: `${product.title} • Collect from West Ealing store`,
    });
    navigate('/checkout?method=collect');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">{categoryTitle}</h1>
          <p className="text-xl text-blue-100">
            {category
              ? `Browse our selection of premium ${categoryTitle.toLowerCase()}`
              : 'Browse our extensive collection of premium electronics and appliances'
            }
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <Link to={`/product/${product.id}`}>
                <div className="relative overflow-hidden bg-gray-100">
                  {product.badge && (
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold z-10 ${product.badge === 'SALE' ? 'bg-red-500 text-white' :
                        product.badge === 'HOT' ? 'bg-orange-500 text-white' :
                          'bg-green-500 text-white'
                      }`}>
                      {product.badge}
                    </div>
                  )}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({product.reviews} reviews)</span>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    £{product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    £{product.originalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleCollectAtStore(product)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    Collect at Store
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}