import { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';
import { getCmsContentByType, type CmsContent } from '../services/cmsService';
import { getProductById, type Product } from '../services/productService';
import productHeadphones from '../assets/product-headphones.jpg';
import productbluray from '../assets/product-blu-ray.jpg';
import productcdr from '../assets/product-cdr.jpg';
import productearbuds from '../assets/product-earbuds.jpg';

const HARDCODED_DEFAULTS = [
  { name: 'TDK NC150', description: 'On-Ear Headphones with Active Noise Cancellation', price: '£34.99', originalPrice: '£13.95', badge: 'Best Seller', badgeColor: 'bg-blue-600', image: productHeadphones },
  { name: 'Verbatim BD-R SL 25GB', description: '6x speed, Jewel case Pack of 5', price: '£13.95', image: productbluray },
  { name: 'Maxell CD-R Audio', description: 'CD-RXx 32x speed, 25 Pack Spindle', price: '£9.99', badge: 'Sale', badgeColor: 'bg-red-500', image: productcdr },
  { name: 'Panasonic RP-HV41E-W', description: 'Headphones - White', price: '£8.99', image: productearbuds },
];

export function FeaturedProducts() {
  const [cmsData, setCmsData] = useState<CmsContent | null>(null);
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);

  useEffect(() => {
    getCmsContentByType('featured_products').then(async (data) => {
      setCmsData(data);
      const ids: string[] = (data?.metadata?.productIds as string[]) || [];
      if (ids.length > 0) {
        const fetched = await Promise.all(ids.map(id => getProductById(id)));
        setFirestoreProducts(fetched.filter(Boolean) as Product[]);
      }
    }).catch(console.error);
  }, []);

  const sectionTitle = cmsData?.title || 'Featured Products';
  const sectionSubtitle = cmsData?.description || 'Handpicked electronics at unbeatable prices';
  const ctaText = cmsData?.ctaText || 'View All Products';
  const ctaLink = cmsData?.ctaLink || '/products/tvs';
  const useFirestore = firestoreProducts.length > 0;

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">{sectionTitle}</h2>
            <p className="text-gray-600">{sectionSubtitle}</p>
          </div>
          <Link to={ctaLink} className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
            {ctaText} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useFirestore
            ? firestoreProducts.map((product) => {
                const isOutOfStock = product.stock?.status === 'out_of_stock' || (product.stock?.quantity ?? 0) <= 0;
                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group block"
                  >
                    <div className="relative bg-gray-50 h-48 flex items-center justify-center overflow-hidden">
                      {isOutOfStock ? (
                        <span className="absolute top-4 left-4 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10 shadow-sm">
                          OUT OF STOCK
                        </span>
                      ) : product.badge && (
                        <span className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                          {product.badge}
                        </span>
                      )}
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale opacity-60' : ''
                            }`}
                        />
                      ) : (
                        <ShoppingBag className={`w-12 h-12 text-gray-300 ${isOutOfStock ? 'grayscale opacity-40' : ''}`} />
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">£{product.pricing?.sellingPrice?.toFixed(2)}</span>
                        {product.pricing?.originalPrice && product.pricing.originalPrice > product.pricing.sellingPrice && (
                          <span className="text-sm text-gray-400 line-through">£{product.pricing.originalPrice.toFixed(2)}</span>
                        )}
                        {isOutOfStock && <span className="ml-auto text-xs font-bold text-red-600 uppercase">Unavailable</span>}
                      </div>
                    </div>
                  </Link>
                );
              })
            : HARDCODED_DEFAULTS.map((product, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative bg-gray-50">
                  {product.badge && (
                    <span className={`absolute top-4 left-4 ${product.badgeColor} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                      {product.badge}
                    </span>
                  )}
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                    {product.originalPrice && <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
}
