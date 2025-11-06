export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50 py-12 sm:py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 border border-coffee-200">
          <h1 className="text-4xl sm:text-5xl font-light text-coffee-900 mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-coffee-600 mb-8 font-light">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-8 text-coffee-800">
            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                1. Information We Collect
              </h2>
              <div className="space-y-3 font-light">
                <h3 className="text-lg font-medium text-coffee-900">Account Information</h3>
                <p>
                  When you create an account, we collect your name, email address, and password (if not using social login).
                  If you sign in with Google, we receive your basic profile information including your name, email, and profile picture.
                </p>

                <h3 className="text-lg font-medium text-coffee-900 mt-4">Order Information</h3>
                <p>
                  When you place an order, we collect shipping address, billing information, and payment details processed securely through Stripe.
                </p>

                <h3 className="text-lg font-medium text-coffee-900 mt-4">Usage Information</h3>
                <p>
                  We collect information about how you interact with our website, including pages visited, products viewed, and time spent on our site.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 font-light">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Provide customer support</li>
                <li>Improve our products and services</li>
                <li>Send promotional emails (with your consent)</li>
                <li>Prevent fraud and enhance security</li>
                <li>Analyze site usage and performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                3. Third-Party Services
              </h2>
              <div className="space-y-3 font-light">
                <p>We use the following third-party services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Google OAuth:</strong> For authentication. View{' '}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coffee-700 hover:text-coffee-900 underline"
                    >
                      Google's Privacy Policy
                    </a>
                  </li>
                  <li>
                    <strong>Stripe:</strong> For payment processing. View{' '}
                    <a
                      href="https://stripe.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coffee-700 hover:text-coffee-900 underline"
                    >
                      Stripe's Privacy Policy
                    </a>
                  </li>
                  <li>
                    <strong>Vercel Analytics:</strong> For website analytics and performance monitoring
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                4. Data Security
              </h2>
              <p className="font-light">
                We implement industry-standard security measures to protect your personal information.
                Passwords are encrypted using bcrypt, and all sensitive data is transmitted over HTTPS.
                Payment information is processed securely through Stripe and never stored on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                5. Cookies
              </h2>
              <p className="font-light">
                We use essential cookies for authentication and session management. These cookies are necessary
                for the website to function properly. We also use analytics cookies to understand how visitors
                use our site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                6. Your Rights
              </h2>
              <p className="font-light mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 font-light">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data</li>
              </ul>
              <p className="font-light mt-4">
                To exercise these rights, visit your account settings or contact us at the email below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                7. Account Deletion
              </h2>
              <p className="font-light">
                You can delete your account at any time from your account settings. When you delete your account,
                all your personal information, orders, reviews, and subscriptions will be permanently removed from
                our database. This action cannot be undone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                8. Children's Privacy
              </h2>
              <p className="font-light">
                Our service is not directed to children under 13. We do not knowingly collect personal information
                from children under 13. If you believe we have collected information from a child under 13, please
                contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                9. Changes to This Policy
              </h2>
              <p className="font-light">
                We may update this privacy policy from time to time. We will notify you of any changes by posting
                the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-coffee-900 mb-3 tracking-tight">
                10. Contact Us
              </h2>
              <p className="font-light">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-4 p-4 bg-coffee-50 rounded-lg font-light">
                <p className="mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@ellabeancoffee.com" className="text-coffee-700 hover:text-coffee-900 underline">
                    privacy@ellabeancoffee.com
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
