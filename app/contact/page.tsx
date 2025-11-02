import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50 py-12 sm:py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <span className="inline-block px-4 py-2 bg-coffee-900 text-white text-xs uppercase tracking-widest font-medium mb-6 rounded-full">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-coffee-900 mb-4 tracking-tight">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl text-coffee-600 font-light max-w-2xl mx-auto">
            Have questions about our coffee, locations, or special orders? We'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-coffee-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-coffee-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-coffee-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-light text-coffee-900 mb-2">Email</h3>
                <p className="text-coffee-600 font-light">hello@ellabean.coffee</p>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="bg-coffee-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-coffee-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-light text-coffee-900 mb-2">Phone</h3>
                <p className="text-coffee-600 font-light">(555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-coffee-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-coffee-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-light text-coffee-900 mb-2">Location</h3>
                <p className="text-coffee-600 font-light">Mobile Coffee Service<br />Your City, USA</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-coffee-200">
            <h3 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">Send us a Message</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
