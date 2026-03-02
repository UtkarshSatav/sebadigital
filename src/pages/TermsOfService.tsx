export function TermsOfService() {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-3xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                    <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                            <p>Welcome to Seba Digital. By accessing our website, you agree to these Terms of Service. These terms cover your use of our website, products, and services provided at our physical store in West Ealing, London, and online.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Products & Pricing</h2>
                            <p>All products are subject to availability. We reserve the right to discontinue any product at any time. We make every effort to display as accurately as possible the colors and images of our products. Prices for our products are subject to change without notice.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Billing & Account Information</h2>
                            <p>We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Media Transfer Services</h2>
                            <p>When utilizing our media transfer services (VHS to DVD, audio transfers, etc.), you confirm that you own the copyright to the content or have explicit permission to duplicate it. We are not responsible for tapes or media damaged due to pre-existing wear and tear during the transfer process.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Warranties</h2>
                            <p>New products come with standard manufacturer warranties. Used or refurbished items, if sold, will have their specific warranty conditions stated at the time of purchase.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
                            <p>Questions about the Terms of Service should be sent to us at info@sebadigital.co.uk.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
