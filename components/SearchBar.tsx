"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  const router = useRouter();

  // Check if component is mounted (for portal)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock scroll position while typing
  useEffect(() => {
    if (!isTyping) return;

    const preventScroll = (e: Event) => {
      window.scrollTo(0, scrollPositionRef.current);
    };

    window.addEventListener('scroll', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('scroll', preventScroll);
    };
  }, [isTyping]);

  // Update dropdown position when opening or on scroll/resize
  useEffect(() => {
    const updatePosition = () => {
      if (searchRef.current && isOpen) {
        const rect = searchRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search products with debounce
  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setIsTyping(true); // Keep scroll locked during search

      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
        // Release scroll lock after results are ready
        setTimeout(() => setIsTyping(false), 100);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission that might cause page jump
      if (results.length > 0) {
        router.push(`/products/${results[0].id}`);
        setIsOpen(false);
        setQuery("");
      }
    }
    // Prevent arrow keys from scrolling the page when dropdown is open
    if (isOpen && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xs">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            scrollPositionRef.current = window.scrollY;
            setIsTyping(true);
            setQuery(e.target.value);

            // Release typing lock after a brief delay
            setTimeout(() => setIsTyping(false), 100);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            scrollPositionRef.current = window.scrollY;
          }}
          onBlur={() => {
            setIsTyping(false);
          }}
          placeholder="Search..."
          autoComplete="off"
          className="w-full px-4 py-2 pl-10 pr-10 text-sm border border-coffee-200 rounded-full focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent bg-white"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-400 hover:text-coffee-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown - Rendered via Portal */}
      {isMounted && isOpen && createPortal(
        <div
          className="fixed bg-white rounded-2xl shadow-2xl border border-coffee-100 overflow-y-auto z-[100]"
          style={{
            top: `${dropdownPosition.top + 8}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            maxHeight: 'min(24rem, calc(100vh - 120px))',
            willChange: 'auto'
          }}
        >
          {loading ? (
            <div className="p-4 text-center text-coffee-600">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-coffee-600 border-t-transparent rounded-full"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs text-coffee-500 uppercase tracking-wider font-medium">
                {results.length} {results.length === 1 ? "Result" : "Results"}
              </div>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-coffee-50 transition-colors cursor-pointer"
                >
                  <div className="relative w-12 h-12 flex-shrink-0 bg-coffee-100 rounded-lg overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-coffee-900 truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-coffee-600">{product.category}</span>
                      <span className="text-xs text-coffee-400">•</span>
                      <span className="text-xs font-medium text-coffee-900">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-coffee-300 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center">
              <div className="inline-block p-3 bg-coffee-50 rounded-full mb-3">
                <svg
                  className="w-8 h-8 text-coffee-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-coffee-600 text-sm">No products found for "{query}"</p>
              <p className="text-coffee-500 text-xs mt-1">Try a different search term</p>
            </div>
          ) : null}
        </div>,
        document.body
      )}
    </div>
  );
}
