import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Store, Disc, Loader2 } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router';
import { getProducts, Product } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

// ─── Blank Media sub-categories ───────────────────────────────────────────────
const BLANK_MEDIA_SUBCATEGORIES = [
  { label: 'CD-R', slug: 'cd-r', description: 'Recordable CDs for audio, data & backups' },
  { label: 'DVD and DVD-RAM', slug: 'dvd-and-dvd-ram', description: 'Blank DVDs and rewritable DVD-RAM discs' },
  { label: 'Mini DVM', slug: 'mini-dvm', description: 'Mini DV MiniDVM cassettes for camcorders' },
  { label: 'Audio Tape', slug: 'audio-tape', description: 'Blank audio cassette tapes' },
  { label: 'Mini Disc', slug: 'mini-disc', description: 'Sony MiniDisc recordable media' },
  { label: 'Blu-ray Disc', slug: 'blu-ray-disc', description: 'High-capacity blank Blu-ray discs' },
  { label: 'Video Tape', slug: 'video-tape', description: 'VHS and S-VHS blank video tapes' },
  { label: '8mm and Hi8 Tape', slug: '8mm-hi8-tape', description: '8mm and Hi8 camcorder tapes' },
];

const BLANK_MEDIA_SLUGS = new Set(BLANK_MEDIA_SUBCATEGORIES.map(s => s.slug));
const BLANK_MEDIA_PARENT = 'blank-media';

// ─── Format category title nicely ─────────────────────────────────────────────
function formatCategoryTitle(category?: string): string {
  if (!category) return 'All Products';
  const found = BLANK_MEDIA_SUBCATEGORIES.find(s => s.slug === category);
  if (found) return found.label;
  return category
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function Products() {
  const { category } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const filters: any = {};
        if (category && category !== BLANK_MEDIA_PARENT) {
          filters.categorySlug = category;
        }
        // isActive is filtered client-side inside productService to avoid Firestore composite index requirement
        const { products } = await getProducts(filters);
        setFilteredProducts(products);
      } catch (err) {
        console.error('Error loading products', err);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [category]);

  const categoryTitle = formatCategoryTitle(category);

  const handleAddToCart = (product: Product) => {
    const isOutOfStock = product.stock?.status === 'out_of_stock' || (product.stock?.quantity ?? 0) <= 0;
    if (isOutOfStock) {
      toast.error('This item is currently out of stock');
      return;
    }
    addToCart({
      id: product.id!,
      title: product.title,
      price: product.pricing?.sellingPrice || 0,
      image: product.image,
    });
    toast.success('Item added to cart', { description: product.title });
  };

  const handleCollectAtStore = (product: Product) => {
    const isOutOfStock = product.stock?.status === 'out_of_stock' || (product.stock?.quantity ?? 0) <= 0;
    if (isOutOfStock) {
      toast.error('This item is currently out of stock');
      return;
    }
    addToCart({
      id: product.id!,
      title: product.title,
      price: product.pricing?.sellingPrice || 0,
      image: product.image,
    });
    toast.success('Item added — Click & Collect selected', {
      description: `${product.title} • Collect from West Ealing store`,
    });
    navigate('/checkout?method=collect');
  };

  // ─── Blank Media parent: show sub-category grid ───────────────────────────
  const isBlankMediaParent = category === BLANK_MEDIA_PARENT;
  const isBlankMediaSub = category ? BLANK_MEDIA_SLUGS.has(category) : false;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb for blank media sub */}
          {isBlankMediaSub && (
            <div className="mb-3">
              <Link to="/products/blank-media" className="text-blue-200 hover:text-white text-sm underline">
                ← Blank Media
              </Link>
            </div>
          )}
          <h1 className="text-5xl font-bold mb-4">{categoryTitle}</h1>
          <p className="text-xl text-blue-100">
            {isBlankMediaParent
              ? 'Browse our full range of blank media — tapes, discs, cassettes and more'
              : category
                ? `Browse our selection of premium ${categoryTitle.toLowerCase()}`
                : 'Browse our extensive collection of premium electronics and appliances'
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ── Blank Media parent → show 8 sub-category cards ─────────────────── */}
        {isBlankMediaParent && (
          <div>
            <p className="text-gray-500 text-sm mb-6">Select a media type to browse products</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BLANK_MEDIA_SUBCATEGORIES.map((item) => (
                <Link
                  key={item.slug}
                  to={`/products/${item.slug}`}
                  className="group bg-white border-2 border-gray-100 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center text-center gap-4 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Disc className="w-8 h-8 text-cyan-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-700 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                  <span className="text-xs font-medium text-blue-600 group-hover:underline mt-auto">
                    Shop {item.label} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Sub-category or regular category → show products ───────────────── */}
        {!isBlankMediaParent && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </p>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-24">
                    <Disc className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No products yet</h3>
                    <p className="text-gray-400 mb-6">
                      Products for <strong>{categoryTitle}</strong> haven't been added yet.
                    </p>
                    {isBlankMediaSub && (
                      <Link
                        to="/products/blank-media"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
                      >
                        ← Back to Blank Media
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                      const isOutOfStock = product.stock?.status === 'out_of_stock' || (product.stock?.quantity ?? 0) <= 0;
                      return (
                        <div
                          key={product.id}
                          className={`bg-white border rounded-lg overflow-hidden hover:shadow-xl transition-shadow group ${isOutOfStock ? 'border-gray-200' : 'border-gray-200'
                            }`}
                        >
                          <Link to={`/product/${product.id}`}>
                            <div className="relative overflow-hidden bg-gray-100">
                              {isOutOfStock ? (
                                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold z-10 bg-gray-500 text-white">
                                  OUT OF STOCK
                                </div>
                              ) : product.badge && (
                                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold z-10 ${product.badge === 'SALE' ? 'bg-red-500 text-white' :
                                  product.badge === 'HOT' ? 'bg-orange-500 text-white' :
                                    'bg-green-500 text-white'
                                  }`}>
                                  {product.badge}
                                </div>
                              )}
                              <img
                                src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                                alt={product.title}
                                className={`w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale opacity-60' : ''
                                  }`}
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
                              <span className="text-xs text-gray-500">({product.reviewCount} reviews)</span>
                            </div>

                            <div className="flex items-baseline gap-2 mb-4">
                              <span className="text-2xl font-bold text-blue-600">
                                £{product.pricing?.sellingPrice?.toFixed(2) || '0.00'}
                              </span>
                              {product.pricing?.originalPrice > product.pricing?.sellingPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  £{product.pricing?.originalPrice?.toFixed(2)}
                                </span>
                              )}
                            </div>

                            <div className="space-y-2">
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={isOutOfStock}
                                className={`w-full py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors ${isOutOfStock
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  }`}
                              >
                                <ShoppingCart className="w-4 h-4" />
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                              </button>
                              <button
                                onClick={() => handleCollectAtStore(product)}
                                disabled={isOutOfStock}
                                className={`w-full py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors ${isOutOfStock
                                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                              >
                                <Store className="w-4 h-4" />
                                {isOutOfStock ? 'Available Soon' : 'Collect at Store'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}