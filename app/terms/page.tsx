export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50 py-12 sm:py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 border border-coffee-200">
          <h1 className="text-4xl sm:text-5xl font-light text-coffee-900 mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-coffee-600 mb-8 font-light">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-8 text-coffee-800">
            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                1. Acceptance of Terms
              </h2>
              <p className="font-light">
                By accessing and using Ella Bean Coffee's website and services, you accept and agree to be bound by
                the terms and provision of this agreement. If you do not agree to these terms, please do not use our
                services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                2. Use of Services
              </h2>
              <div className="space-y-3 font-light">
                <h3 className="text-lg font-medium text-coffee-900">Account Registration</h3>
                <p>
                  You may create an account using email and password or by signing in with your Google account.
                  You are responsible for maintaining the confidentiality of your account credentials and for all
                  activities that occur under your account.
                </p>

                <h3 className="text-lg font-medium text-coffee-900 mt-4">Acceptable Use</h3>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the service for any illegal purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Submit false or misleading information</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                3. Products and Orders
              </h2>
              <div className="space-y-3 font-light">
                <h3 className="text-lg font-medium text-coffee-900">Product Information</h3>
                <p>
                  We strive to provide accurate product descriptions and pricing. However, we do not warrant that
                  product descriptions, pricing, or other content is accurate, complete, reliable, or error-free.
                </p>

                <h3 className="text-lg font-medium text-coffee-900 mt-4">Pricing</h3>
                <p>
                  All prices are in USD. We reserve the right to change prices at any time. Prices shown at the
                  time of order placement are the prices you will be charged.
                </p>

                <h3 className="text-lg font-medium text-coffee-900 mt-4">Order Acceptance</h3>
                <p>
                  We reserve the right to refuse or cancel any order for any reason, including but not limited to:
                  product availability, errors in pricing or product information, or suspected fraudulent activity.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                4. Payment and Billing
              </h2>
              <div className="space-y-3 font-light">
                <p>
                  Payment processing is handled securely through Stripe. By placing an order, you authorize us to
                  charge your payment method for the total amount of your purchase.
                </p>
                <p>
                  You represent and warrant that you have the legal right to use any payment method you provide
                  to us.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                5. Shipping and Delivery
              </h2>
              <div className="space-y-3 font-light">
                <p>
                  We will make reasonable efforts to deliver products within estimated timeframes, but we cannot
                  guarantee delivery dates. Title and risk of loss pass to you upon delivery to the carrier.
                </p>
                <p>
                  You are responsible for providing accurate shipping information. We are not responsible for
                  delays or non-delivery due to incorrect addresses.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                6. Returns and Refunds
              </h2>
              <div className="space-y-3 font-light">
                <p>
                  We want you to be satisfied with your purchase. If you're not happy with your order, please
                  contact us within 30 days of delivery.
                </p>
                <p>
                  Returns must be in original, unopened packaging to be eligible for a refund. Opened products
                  may not be eligible for return due to health and safety regulations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                7. Subscriptions
              </h2>
              <div className="space-y-3 font-light">
                <p>
                  If you sign up for a subscription service, you authorize us to charge your payment method on a
                  recurring basis according to your chosen frequency (weekly, biweekly, or monthly).
                </p>
                <p>
                  You may cancel your subscription at any time from your account settings. Cancellation will take
                  effect at the end of the current billing period.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                8. Reviews and User Content
              </h2>
              <div className="space-y-3 font-light">
                <p>
                  You may submit reviews and ratings for products you have purchased. By submitting content, you
                  grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your
                  content.
                </p>
                <p>
                  We reserve the right to remove any content that violates these terms or is otherwise objectionable.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                9. Intellectual Property
              </h2>
              <p className="font-light">
                All content on this website, including text, graphics, logos, images, and software, is the property
                of Ella Bean Coffee and is protected by copyright and trademark laws. You may not use, reproduce,
                or distribute any content without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                10. Limitation of Liability
              </h2>
              <p className="font-light">
                To the fullest extent permitted by law, Ella Bean Coffee shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
                whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible
                losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                11. Disclaimer of Warranties
              </h2>
              <p className="font-light">
                Our services are provided "as is" and "as available" without any warranties of any kind, either
                express or implied. We do not warrant that the service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                12. Third-Party Services
              </h2>
              <p className="font-light">
                Our website integrates with third-party services including Google (for authentication), Stripe
                (for payments), and Vercel (for analytics). Your use of these services is subject to their
                respective terms of service and privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                13. Account Termination
              </h2>
              <div className="space-y-3 font-light">
                <p>
                  You may delete your account at any time from your account settings. Upon deletion, all your
                  personal data and order history will be permanently removed.
                </p>
                <p>
                  We reserve the right to suspend or terminate your account if you violate these terms or engage
                  in fraudulent activity.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                14. Governing Law
              </h2>
              <p className="font-light">
                These terms shall be governed by and construed in accordance with the laws of the United States,
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                15. Changes to Terms
              </h2>
              <p className="font-light">
                We reserve the right to modify these terms at any time. We will notify users of any material
                changes by posting the new terms on this page and updating the "Last Updated" date. Your
                continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                16. Contact Information
              </h2>
              <p className="font-light mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="p-4 bg-coffee-50 rounded-lg font-light">
                <p className="mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@ellabeancoffee.com" className="text-coffee-700 hover:text-coffee-900 underline">
                    support@ellabeancoffee.com
                  </a>
                </p>
                <p>
                  <strong>Website:</strong>{' '}
                  <a href="/" className="text-coffee-700 hover:text-coffee-900 underline">
                    ellabeancoffee.com
                  </a>
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-coffee-200">
            <a
              href="/"
              className="inline-block bg-coffee-900 text-white px-8 py-3 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
