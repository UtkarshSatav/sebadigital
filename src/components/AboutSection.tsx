import { useState, useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router';
import { getCmsContentByType, type CmsContent } from '../services/cmsService';

const DEFAULT_BRANDS = ['TDK', 'Panasonic', 'Philips', 'Sony', 'JVC', 'Maxell', 'Memorex', 'Verbatim', 'Nexis', 'Kingston'];
const DEFAULT_FEATURES = [
  'Family-Owned 30+ Years',
  'Expert Technical Support',
  'Competitive Pricing',
  'Professional DVD Transfer Services',
];
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1695624825454-7ace45436e27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHN0b3JlJTIwc2hvcGZyb250JTIwYmx1ZXxlbnwxfHx8fDE3NzA5OTk2MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080';

export function AboutSection() {
  const [cmsData, setCmsData] = useState<CmsContent | null>(null);

  useEffect(() => {
    getCmsContentByType('policy').then(setCmsData).catch(console.error);
  }, []);

  const brands: string[] = (cmsData?.metadata?.brands as string[]) || DEFAULT_BRANDS;
  const features: string[] = (cmsData?.metadata?.features as string[]) || DEFAULT_FEATURES;
  const image = cmsData?.image || DEFAULT_IMAGE;

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Store image */}
          <div>
            <img
              src={image}
              alt="Seba Digital Store"
              className="w-full rounded-2xl shadow-lg"
            />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {cmsData?.title || 'About Seba Digital'}
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
              {cmsData?.description ||
                'Seba Digital is a well-established, family-run business based in West Ealing, London. We are known for offering quality products at competitive prices, supported by friendly, personal customer service.'}
            </p>
            {!cmsData?.description && (
              <p className="text-gray-600 mb-8 leading-relaxed">
                We specialise in blank media, TV brackets and cabinets, TV cables, headphones, mobile leads, and accessories.
              </p>
            )}

            {/* Brands */}
            <div className="mb-8">
              <div className="text-sm font-semibold text-gray-900 mb-3">Trusted Brands We Stock:</div>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand, index) => (
                  <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              to={cmsData?.ctaLink || '/contact'}
              className="inline-flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium items-center gap-2 transition-colors"
            >
              {cmsData?.ctaText || 'Learn More About Us'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
