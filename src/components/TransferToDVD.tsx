// import { Phone, Award, CheckCircle2 } from 'lucide-react';

// export function TransferToDVD() {
//   const formats = ['VHS', 'VHS-C', 'Video8', 'Hi8', 'Digital8', 'MiniDV', 'Mini DVD (Disc Based)'];
//   const steps = [
//     'Send us your tapes',
//     'We transfer to DVD',
//     'We invoice via PayPal',
//     'We return via Royal Mail Tracked'
//   ];

//   return (
//     <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 py-20 relative overflow-hidden">
//       <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6TTAgMTZjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHptMTggMGMwLTQuNDE4IDMuNTgyLTggOC04czggMy41ODIgOCA4LTMuNTgyIDgtOCA4LTgtMy41ODItOC04eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
//       <div className="relative max-w-7xl mx-auto px-6">
//         <div className="grid md:grid-cols-2 gap-12 items-start">
//           {/* Left content */}
//           <div className="text-white">
//             <div className="flex items-center gap-2 mb-4">
//               <Award className="w-6 h-6 text-yellow-300" />
//               <span className="text-sm font-semibold uppercase text-yellow-300">30+ Years Experience</span>
//             </div>
            
//             <h2 className="text-4xl font-bold mb-6">
//               Transfer to DVD Services
//             </h2>
            
//             <p className="text-blue-100 mb-8 leading-relaxed">
//               With over 30 years' experience, we specialise in transferring older media formats to DVD. Simply send us your tapes — once complete, we'll invoice via PayPal and return your order securely.
//             </p>

//             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
//               <div className="flex items-baseline gap-3 mb-2">
//                 <span className="text-5xl font-bold text-yellow-300">£6.00</span>
//                 <span className="text-blue-100">per tape</span>
//               </div>
//               <p className="text-sm text-blue-200">Affordable media transfer services</p>
//             </div>

//             <a
//               href="tel:02085678550"
//               className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded font-semibold"
//             >
//               <Phone className="w-5 h-5" />
//               Call: 0208 567 8550
//             </a>
//           </div>

//           {/* Right cards */}
//           <div className="space-y-6">
//             {/* Supported Formats */}
//             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
//               <div className="flex items-center gap-2 text-yellow-300 mb-4">
//                 <CheckCircle2 className="w-5 h-5" />
//                 <h3 className="font-bold text-white">Supported Formats</h3>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {formats.map((format, index) => (
//                   <span
//                     key={index}
//                     className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded text-sm border border-white/20"
//                   >
//                     {format}
//                   </span>
//                 ))}
//               </div>
//               <p className="text-sm text-blue-200 mt-4">
//                 Audio Cassette to CD (up to 90 min old)
//               </p>
//             </div>

//             {/* How It Works */}
//             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
//               <div className="flex items-center gap-2 text-yellow-300 mb-4">
//                 <CheckCircle2 className="w-5 h-5" />
//                 <h3 className="font-bold text-white">How It Works</h3>
//               </div>
//               <ol className="space-y-3">
//                 {steps.map((step, index) => (
//                   <li key={index} className="flex items-start gap-3 text-white">
//                     <span className="flex-shrink-0 w-6 h-6 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center text-sm font-bold">
//                       {index + 1}
//                     </span>
//                     <span>{step}</span>
//                   </li>
//                 ))}
//               </ol>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }




import { Phone, CheckCircle2, Disc, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router';

export function TransferToDVD() {
  const services = [
    {
      title: 'VHS to DVD Transfer',
      description: 'Convert your old video tapes to modern DVD format',
      formats: ['VHS', 'VHS-C', 'Video8', 'Hi8', 'Digital8', 'MiniDV', 'Mini DVD']
    },
    {
      title: 'Audio Cassette to CD',
      description: 'Digitize your audio cassette recordings',
      formats: ['Up to 1 hour recording per tape']
    }
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Disc className="w-4 h-4" />
            Media Transfer Services
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transfer to DVD & CD Services
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Preserve your precious memories with our professional media transfer services. Over 30 years of trusted experience.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Disc className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-2">Supported formats:</p>
                {service.formats.map((format, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{format}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h3>
          <div className="grid md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
                1
              </div>
              <p className="text-gray-700 font-medium">Contact us for a quote</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
                2
              </div>
              <p className="text-gray-700 font-medium">Send us your media</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
                3
              </div>
              <p className="text-gray-700 font-medium">We transfer to DVD/CD</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
                4
              </div>
              <p className="text-gray-700 font-medium">We invoice via PayPal</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
                5
              </div>
              <p className="text-gray-700 font-medium">Return via Royal Mail</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-xl p-10 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Preserve Your Memories?
          </h3>
          <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
            Contact us today for pricing and service details. Our expert team is here to help with your media transfer needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Get a Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <a
              href="tel:02085678550"
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              0208 567 8550
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">30+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Fast Turnaround</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}