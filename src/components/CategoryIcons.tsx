import { Link } from 'react-router';
import { Tv, Camera, Film, Phone, Headphones, Plug, Disc } from 'lucide-react';

export function CategoryIcons() {
  const categories = [
    { icon: Tv, label: 'TVs', color: 'bg-blue-100 text-blue-600', slug: 'tvs' },
    { icon: Camera, label: 'Cameras', color: 'bg-green-100 text-green-600', slug: 'cameras' },
    { icon: Film, label: 'Entertainment', color: 'bg-red-100 text-red-600', slug: 'entertainment' },
    { icon: Phone, label: 'Phones', color: 'bg-purple-100 text-purple-600', slug: 'phones' },
    { icon: Headphones, label: 'Headphones', color: 'bg-pink-100 text-pink-600', slug: 'headphones' },
    { icon: Plug, label: 'Accessories', color: 'bg-orange-100 text-orange-600', slug: 'accessories' },
    { icon: Disc, label: 'Media', color: 'bg-teal-100 text-teal-600', slug: 'media' },
    { icon: Disc, label: 'Blank Media', color: 'bg-cyan-100 text-cyan-600', slug: 'blank-media' },
  ];

  return (
    <section className="bg-white py-12 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={index}
                to={`/products/${category.slug}`}
                className="flex flex-col items-center gap-3 hover:scale-105 transition-transform"
              >
                <div className={`w-14 h-14 rounded-full ${category.color} flex items-center justify-center`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-sm text-gray-700 font-medium text-center">{category.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
