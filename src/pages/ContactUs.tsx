import { MapPin, Phone, Mail, Clock, Disc } from 'lucide-react';

export function ContactUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            We're here to help! Get in touch with us for any questions, support, or just to say hello.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="0208 567 8550"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                  <option>General Inquiry</option>
                  <option>Product Question</option>
                  <option>Technical Support</option>
                  <option>VHS to DVD Transfer</option>
                  <option>Audio Cassette to CD Transfer</option>
                  <option>TV Installation</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            
            <div className="space-y-6 mb-12">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Warehouse Location</h3>
                  <p className="text-gray-600">
                    Seba Digital<br />
                    West Ealing, London<br />
                    United Kingdom
                  </p>
                  <p className="text-sm text-orange-600 font-medium mt-2">
                    Collection only - No retail store
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Call Us</h3>
                  <p className="text-gray-600">
                    <a href="tel:02085678550" className="hover:text-blue-600">
                      0208 567 8550
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email Us</h3>
                  <p className="text-gray-600">
                    <a href="mailto:info@sebadigital.co.uk" className="hover:text-blue-600">
                      info@sebadigital.co.uk
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Collection Hours</h3>
                  <div className="text-gray-600 space-y-1">
                    <p className="font-semibold">Monday - Friday: 10:00 AM - 2:00 PM</p>
                    <p className="text-sm text-gray-500">For order collection only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Services Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Disc className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Transfer to DVD Services</h3>
                  <ul className="space-y-1.5 text-gray-700 mb-3">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>VHS to DVD Transfer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Audio Cassette to Audio CD (up to 1 hour recording per tape)</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600">
                    Contact us for pricing and service details. Use the form or call us directly.
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Map View</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you offer delivery?</h3>
              <p className="text-gray-600">
                Yes! We offer free standard delivery (3-5 working days) on all orders. Next day delivery is available for £4.99 when ordered before 2:00pm on a working day.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">What is Click & Collect?</h3>
              <p className="text-gray-600">
                Order online and collect from our warehouse for free. Collection is available Monday to Friday, 10:00am - 2:00pm. Please note we operate from a warehouse only, not a retail store.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit/debit cards (Visa, Mastercard, American Express) securely through our checkout.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">What is your return policy?</h3>
              <p className="text-gray-600">
                Once your conversion is complete, we’ll return your order free of charge via Royal Mail Tracked if you order is more one For single-item orders, a £3.49 return fee applies
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">How long does VHS to DVD transfer take?</h3>
              <p className="text-gray-600">
                The turnaround time depends on how many tapes you’d like converted. Get in touch with your specific requirements and we’ll provide an accurate timeframe and quote.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Can I visit your store?</h3>
              <p className="text-gray-600">
                We operate from a warehouse for order collection only, Monday to Friday, 10:00am - 2:00pm. Please order online or contact us before visiting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}