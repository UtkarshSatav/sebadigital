import { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';
import { getCmsContentByType, type CmsContent } from '../services/cmsService';
import { getProductById, type Product } from '../services/productService';
import productdvdrw from '../assets/product-dvd-rw.jpg';
import producttape from '../assets/product-tape.jpg';
import productdvd from '../assets/product-dvd.jpg';
import productwall from '../assets/product-bracket.jpg';

const HARDCODED_DEFAULTS = [
  { name: 'Memorex DVD-RW', description: '24 speed, 4.7GB, 120 min, Spindle', price: '£12.99', badge: 'New', badgeColor: 'bg-green-500', image: productdvdrw },
  { name: 'Maxell LR03 AAA Triple A Tape', description: 'AAA Batteries x10 Pack', price: '£2.99', image: producttape },
  { name: 'TDK DVD-R 25 Pack', description: '16x speed, Recordable Media', price: '£14.99', image: productdvd },
  { name: 'Wall Bracket 22"-55"', description: 'Universal TV Wall Bracket', price: '£19.99', badge: 'Popular', badgeColor: 'bg-yellow-500', image: productwall },
];

export function LatestArrivals() {
  const [cmsData, setCmsData] = useState<CmsContent | null>(null);
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);

  useEffect(() => {
    getCmsContentByType('latest_arrivals').then(async (data) => {
      setCmsData(data);
      const ids: string[] = (data?.metadata?.productIds as string[]) || [];
      if (ids.length > 0) {
        const fetched = await Promise.all(ids.map(id => getProductById(id)));
        setFirestoreProducts(fetched.filter(Boolean) as Product[]);
      }
    }).catch(console.error);
  }, []);

  const sectionTitle = cmsData?.title || 'Latest Arrivals';
  const sectionSubtitle = cmsData?.description || 'New products just added to our collection';
  const ctaText = cmsData?.ctaText || 'View All Products';
  const ctaLink = cmsData?.ctaLink || '/products/tvs';
  const useFirestore = firestoreProducts.length > 0;

  return (
    <section className="bg-white py-20">
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
                        <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
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
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">£{product.pricing?.sellingPrice?.toFixed(2)}</span>
                        {isOutOfStock && <span className="text-xs font-bold text-red-600 uppercase">Restocking Soon</span>}
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
                  <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
}
