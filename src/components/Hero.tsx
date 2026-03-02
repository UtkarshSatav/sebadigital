import { ArrowRight, Award } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getCmsContentByType, type CmsContent } from '../services/cmsService';
import defaultHeroImage from '../assets/hero-product.jpg';

export function Hero() {
  const [cmsData, setCmsData] = useState<CmsContent | null>(null);

  useEffect(() => {
    getCmsContentByType('hero_banner').then(setCmsData).catch(console.error);
  }, []);

  return (
    <section className="relative bg-white overflow-hidden py-20 md:py-32">
      {/* Large blue decorative circle - left */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full opacity-40 -translate-x-1/3 -translate-y-1/3"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 1, ease: "easeOut" }}
      ></motion.div>

      {/* Small blue decorative circle - inside left circle */}
      <motion.div
        className="absolute top-32 left-32 w-64 h-64 bg-blue-500 rounded-full opacity-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
      ></motion.div>

      {/* Yellow/orange decorative circle - bottom right of image */}
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-400 rounded-full opacity-40 translate-x-1/3 translate-y-1/3"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
      ></motion.div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              {cmsData ? (
                <span className="text-gray-900">{cmsData.title}</span>
              ) : (
                <>
                  <span className="text-gray-900">Premium</span>
                  <br />
                  <span className="text-gray-900">Electronics</span>
                  <span className="text-gray-900">,</span>
                  <br />
                  <span className="text-blue-600">Trusted</span>{' '}
                  <span className="text-gray-900">Service</span>
                </>
              )}
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-lg whitespace-pre-line">
              {cmsData ? cmsData.description : (
                <>Family-run since day one. <span className="text-blue-600">Discover</span> cutting-edge TVs, audio equipment, and accessories <span className="text-blue-600">with expert</span> guidance.</>
              )}
            </p>

            <motion.div
              className="flex flex-wrap gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                to={cmsData?.ctaLink || "/products/tvs"}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded font-medium flex items-center gap-2 transition-colors"
              >
                {cmsData?.ctaText || "Explore Products"}
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!cmsData && (
                <Link
                  to="/products/tvs"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded font-medium transition-colors"
                >
                  View Catalog
                </Link>
              )}
            </motion.div>

            {/* Experience badge */}
            <motion.div
              className="inline-flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Award className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">30+ Years Experience</div>
                <div className="text-sm text-gray-500">Family-Run Business Since 1990</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right product card */}
          <motion.div
            className="flex justify-center md:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative">
              {/* In Stock badge */}
              <motion.div
                className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold z-10 shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8, type: "spring", stiffness: 200 }}
              >
                In Stock
              </motion.div>

              {/* Yellow decorative circle - bottom right */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-yellow-400 rounded-full opacity-80 z-0"></div>

              {/* Product card */}
              <motion.div
                className="relative bg-white rounded-3xl shadow-xl overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <ImageWithFallback
                  src={cmsData?.image || defaultHeroImage}
                  alt={cmsData?.title || "Premium Electronics"}
                  className="w-full h-96 object-cover"
                />

                {/* Price badge - bottom left - Only show if not entirely custom CMS */}
                {!cmsData && (
                  <div className="absolute bottom-6 left-6 bg-white px-4 py-3 rounded-lg shadow-lg">
                    <div className="text-xs text-gray-500 mb-1">Starting from</div>
                    <div className="text-2xl font-bold text-blue-600">£8.99</div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}