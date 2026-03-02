export function PrivacyPolicy() {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-3xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                    <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
                            <p>We collect personal information that you provide to us when registering for an account, expressing an interest in obtaining information about us or our products, participating in activities on our website, or otherwise contacting us.</p>
                            <p className="mt-2">This includes: Full name, email address, phone numbers (optional), and billing/shipping addresses when placing an order.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
                            <p>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>To facilitate account creation and authentication</li>
                                <li>To fulfill and manage your orders</li>
                                <li>To send administrative information to you</li>
                                <li>To send marketing and promotional communications (if opted-in)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Security</h2>
                            <p>We implement appropriate technical and organizational security measures to protect the security of any personal information we process. Payments are processed securely via third-party providers (PayPal, Stripe) and we do not store full credit card details.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies</h2>
                            <p>We use cookies and similar tracking technologies to access or store information, maintain user sessions, and gather analytics about website traffic and interactions to offer better site experiences.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
                            <p>If you have questions or comments about this notice, you may email us at info@sebadigital.co.uk.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
