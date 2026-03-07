import { Truck, Headphones, Shield, RotateCcw } from 'lucide-react';

export function BenefitsSection() {
  const benefits = [
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'On all orders, Reliable delivery to your door',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      description: 'Our knowledgeable team is here to help you choose the right product.',
      color: 'text-green-600 bg-green-50',
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: 'Shop with confidence. All your payment details are secure.',
      color: 'text-orange-600 bg-orange-50',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: 'We offer hassle-free returns on all purchases.',
      color: 'text-pink-600 bg-pink-50',
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg ${benefit.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
