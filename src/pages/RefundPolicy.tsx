export function RefundPolicy() {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-3xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Returns & Refunds Policy</h1>
                    <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Return Window</h2>
                            <p>We have a 14-day return policy, which means you have 14 days after receiving your item to request a return. To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Starting a Return</h2>
                            <p>If you have an account, you can initiate a return directly from the <strong>My Orders</strong> section in your profile. Alternatively, contact us at info@sebadigital.co.uk.</p>
                            <p className="mt-2 text-sm bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100">
                                If your return is accepted, we'll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Damages and Issues</h2>
                            <p>Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Exceptions / Non-returnable Items</h2>
                            <p>Certain types of items cannot be returned, like custom products (such as special orders or personalized media transfers). Please get in touch if you have questions or concerns about your specific item.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Refunds</h2>
                            <p>We will notify you once we've received and inspected your return, and let you know if the refund was approved or not. If approved, you'll be automatically refunded on your original payment method. Please remember it can take some time for your bank or credit card company to process and post the refund too.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
