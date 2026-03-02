import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { getCmsContentByType, type CmsContent } from '../services/cmsService';

export function CTASection() {
  const [cmsData, setCmsData] = useState<CmsContent | null>(null);

  useEffect(() => {
    getCmsContentByType('promotions_banner').then(setCmsData).catch(console.error);
  }, []);

  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6TTAgMTZjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHptMTggMGMwLTQuNDE4IDMuNTgyLTggOC04czggMy41ODIgOCA4LTMuNTgyIDgtOCA4LTgtMy41ODItOC04eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-6" />
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {cmsData?.title || 'Ready to Upgrade Your Tech?'}
        </h2>

        {cmsData?.subtitle && (
          <p className="text-2xl text-blue-200 font-semibold mb-4">
            {cmsData.subtitle}
          </p>
        )}

        <p className="text-xl text-blue-100 mb-8 whitespace-pre-line">
          {cmsData?.description || 'Browse our latest collection of premium electronics and find exactly what you need.'}
        </p>

        <Link
          to={cmsData?.ctaLink || "/products/tvs"}
          className="w-fit bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
        >
          {cmsData?.ctaText || 'Shop Now'}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
