import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Star, ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, Store, MapPin, Loader2 } from 'lucide-react';
import { getProductById, getProducts, Product } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

export function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (!id) return;
        const data = await getProductById(id);
        setProduct(data);

        if (data && data.categorySlug) {
          const { products: related } = await getProducts({ categorySlug: data.categorySlug, limitCount: 5 });
          setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching product', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Create gallery with main image plus additional images
  const gallery = product.gallery?.length ? product.gallery : [product.image];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id!,
        title: product.title,
        price: product.pricing?.sellingPrice || 0,
        image: product.image,
      });
    }
    toast.success(`${quantity} item(s) added to cart`, {
      description: product.title,
    });
  };

  const handleCollectAtStore = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id!,
        title: product.title,
        price: product.pricing?.sellingPrice || 0,
        image: product.image,
      });
    }
    toast.success(`${quantity} item(s) added — Click & Collect selected`, {
      description: `${product.title} • Collect from West Ealing store`,
    });
    navigate('/checkout?method=collect');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to={`/products/${product.categorySlug}`} className="text-gray-600 hover:text-blue-600 capitalize">
              {product.categorySlug}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 truncate">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          to={`/products/${product.categorySlug}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {product.categorySlug}
        </Link>

        {/* Product Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
              {product.badge && (
                <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold z-10 ${product.badge === 'SALE' ? 'bg-red-500 text-white' :
                  product.badge === 'HOT' ? 'bg-orange-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                  {product.badge}
                </div>
              )}
              <img
                src={gallery[selectedImage] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative bg-gray-100 rounded-lg overflow-hidden aspect-square border-2 transition-all ${selectedImage === index
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{product.rating}</span>
                </div>
                <span className="text-gray-500">({product.reviewCount} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-blue-600">
                  £{product.pricing?.sellingPrice?.toFixed(2) || '0.00'}
                </span>
                {product.pricing?.originalPrice > product.pricing?.sellingPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      £{product.pricing?.originalPrice?.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Save £{(product.pricing?.originalPrice - product.pricing?.sellingPrice).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="border-t border-b border-gray-200 py-6">
              <h3 className="font-semibold text-gray-900 mb-3">Product Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description ||
                  `Experience premium quality with the ${product.title}. This exceptional product combines cutting-edge technology with outstanding performance, delivering exceptional value for your investment. Perfect for those who demand the best in ${product.categorySlug}.`
                }
              </p>
            </div>

            {/* Key Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Key Features</h3>
              <ul className="space-y-2">
                {[
                  'Premium build quality and materials',
                  'Latest technology and innovation',
                  'Energy efficient design',
                  'Easy to use and set up',
                  'Comprehensive warranty included'
                ].map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-900">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-2 border-x border-gray-300 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </button>
              <button
                onClick={handleCollectAtStore}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-colors"
              >
                <Store className="w-6 h-6" />
                Collect at Store — FREE
              </button>
            </div>

            {/* Store Info */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900 text-sm">Collect from Seba Digital</p>
                  <p className="text-sm text-emerald-700">West Ealing, London</p>
                  <p className="text-xs text-emerald-600 mt-1">Mon–Fri 9am–6pm • Sat 9am–5pm</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                <p className="text-xs text-gray-600">On orders over £50</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">2 Year Warranty</p>
                <p className="text-xs text-gray-600">Protected purchase</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">30 Day Returns</p>
                <p className="text-xs text-gray-600">No questions asked</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  <div className="relative overflow-hidden bg-gray-100">
                    <img
                      src={relatedProduct.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                      alt={relatedProduct.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                      {relatedProduct.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{relatedProduct.rating}</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      £{relatedProduct.pricing?.sellingPrice?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
