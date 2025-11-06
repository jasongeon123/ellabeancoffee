export default function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-6">
      {/* SSL Secure */}
      <div className="flex items-center gap-2 text-green-700">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium">SSL Secure</span>
      </div>

      {/* Secure Checkout */}
      <div className="flex items-center gap-2 text-blue-700">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span className="text-sm font-medium">Secure Checkout</span>
      </div>

      {/* Payment Methods */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <svg className="w-8 h-5" viewBox="0 0 38 24" fill="none">
            <rect width="38" height="24" rx="3" fill="#1434CB" />
            <path
              d="M13.5 8.5h-1.8c-.9 0-1.6.7-1.6 1.6v4.3c0 .9.7 1.6 1.6 1.6h1.8m6.4-7.5h1.8c.9 0 1.6.7 1.6 1.6v4.3c0 .9-.7 1.6-1.6 1.6h-1.8"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <svg className="w-8 h-5" viewBox="0 0 38 24" fill="none">
            <rect width="38" height="24" rx="3" fill="#FF5F00" />
            <circle cx="14" cy="12" r="7" fill="#EB001B" />
            <circle cx="24" cy="12" r="7" fill="#F79E1B" />
          </svg>
          <svg className="w-8 h-5" viewBox="0 0 38 24" fill="none">
            <rect width="38" height="24" rx="3" fill="#00579F" />
            <path d="M12 8h14l-2 8H10l2-8z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div className="flex items-center gap-2 text-emerald-700">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
        <span className="text-sm font-medium">Quality Guaranteed</span>
      </div>
    </div>
  );
}
