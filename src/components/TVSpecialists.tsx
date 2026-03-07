import { useState, useEffect } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { getCmsContentByType, type CmsContent } from '../services/cmsService';

const DEFAULT_FEATURES = [
  'Panasonic OLED 4K HDR PRO TVs',
  '4K Ultra HD TVs',
  'Smart LED TVs',
  'TV Brackets & Cabinets',
  'TV Cables & Accessories',
  'Expert Installation Advice',
];

export function TVSpecialists() {
  const [cmsData, setCmsData] = useState<CmsContent | null>(null);

  useEffect(() => {
    getCmsContentByType('tv_experts').then(setCmsData).catch(console.error);
  }, []);

  // Parse features from metadata or fall back to the default list
  const features: string[] =
    (cmsData?.metadata?.features as string[]) || DEFAULT_FEATURES;

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold uppercase">
                {cmsData?.subtitle || 'EXPERTS'}
              </span>
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {cmsData?.title || 'Your Local TV Specialists'}
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
              {cmsData?.description ||
                `For many years, we have proudly served our local community with professional electronic services, offering expert advice and excellent value on the latest television technology and accessories.

TV Installation & Wall Mounting
We take pride in delivering high-quality workmanship with every installation, ensuring your television is safely and professionally mounted.

Local Service Only – Covering areas within 7 miles of our location.`}
            </p>

            <div className="mb-4">
              <h4 className="font-bold text-gray-900 mb-4">We Supply & Support:</h4>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to={cmsData?.ctaLink || '/contact'}
              className="inline-flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium items-center gap-2 transition-colors mt-4"
            >
              {cmsData?.ctaText || 'Contact Us'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Right promo card */}
          <div className="relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
              <div className="mb-6">
                <Sparkles className="w-12 h-12 text-yellow-300 mb-4" />
                <h3 className="text-3xl font-bold mb-3">
                  {cmsData?.metadata?.promoTitle || 'Special Promotions'}
                </h3>
                <p className="text-blue-100">
                  {cmsData?.metadata?.promoText ||
                    'Check out our latest deals on Panasonic TVs and accessories. Limited time offers available!'}
                </p>
              </div>
              <Link
                to={cmsData?.ctaLink || '/promotions'}
                className="inline-flex bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded font-semibold items-center gap-2 transition-colors"
              >
                {cmsData?.metadata?.promoCta || 'View Promotions'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
