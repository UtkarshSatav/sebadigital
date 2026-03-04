import { Link } from 'react-router';
import { Tv, Camera, Music, CardSim, Smartphone, Headphones, Cable, Disc } from 'lucide-react';

const categories = [
  {
    name: 'TVs',
    slug: 'tvs',
    icon: Tv,
    subcategories: ['QLED TVs', 'OLED TVs', 'Smart TVs', '4K Ultra HD', '8K TVs', 'Gaming TVs']
  },
  {
    name: 'Cameras',
    slug: 'cameras',
    icon: Camera,
    subcategories: ['Mirrorless', 'DSLR', 'Action Cameras', 'Compact', 'Camcorders', 'Lenses']
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    icon: Music,
    subcategories: ['Home Theater', 'Soundbars', 'Blu-ray Players', 'Streaming Devices', 'Projectors', 'Speakers']
  },
  {
    name: 'Storage Devices',
    slug: 'storage-devices',
    icon: CardSim,
    subcategories: ['USB keys', 'Hard drives', 'Memory cards', 'Micro cards', 'SD cards', 'Flash memory']
  },
  {
    name: 'Phones',
    slug: 'phones',
    icon: Smartphone,
    subcategories: ['Smartphones', 'Feature Phones', 'Phone Cases', 'Screen Protectors', 'Chargers', 'Power Banks']
  },
  {
    name: 'Headphones',
    slug: 'headphones',
    icon: Headphones,
    subcategories: ['Wireless', 'Noise Cancelling', 'In-Ear', 'Over-Ear', 'Gaming', 'Sports']
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    icon: Cable,
    subcategories: ['Cables', 'Adapters', 'USB Hubs', 'Memory Cards', 'Remote Controls', 'Batteries']
  },
  {
    name: 'Blank Media',
    slug: 'blank-media',
    icon: Disc,
    subcategories: ['CD-R', 'DVD and DVD-RAM', 'Mini DVM', 'Audio Tape', 'Mini Disc', 'Blu-ray Disc', 'Video Tape', '8mm and Hi8 Tape']
  },
];

interface MegaMenuProps {
  onClose: () => void;
}

export function MegaMenu({ onClose }: MegaMenuProps) {
  return (
    <div className="absolute top-full left-0 right-0 bg-white border-t border-b border-gray-200 shadow-xl z-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.slug} className="space-y-3">
                <Link
                  to={`/products/${category.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors group"
                >
                  <Icon className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  {category.name}
                </Link>
                <ul className="space-y-2">
                  {category.subcategories.map((sub) => (
                    <li key={sub}>
                      <Link
                        to={`/products/${category.slug}`}
                        onClick={onClose}
                        className="text-sm text-gray-600 hover:text-blue-600 hover:translate-x-1 transition-all inline-block"
                      >
                        {sub}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
