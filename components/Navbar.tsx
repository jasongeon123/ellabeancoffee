"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch cart count
  useEffect(() => {
    if (session) {
      fetchCartCount();
    }
  }, [session]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        const count = data.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
        setCartCount(count);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  return (
    <nav
      className={`bg-white/95 backdrop-blur-md border-b sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-coffee-300 shadow-sm" : "border-coffee-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo with Icon */}
          <button
            onClick={() => {
              if (pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                router.push("/");
              }
            }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-coffee-100 flex items-center justify-center group-hover:bg-coffee-200 transition-colors">
              <Image
                src="/logo.jpg"
                alt="Ella Bean"
                fill
                sizes="40px"
                priority
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-light text-coffee-900 tracking-tight group-hover:text-coffee-700 transition-colors">
                Ella Bean
              </span>
              <span className="text-xs text-coffee-500 tracking-wider uppercase">
                Coffee Co.
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#products"
              className="text-coffee-700 hover:text-coffee-900 transition-all font-light text-sm uppercase tracking-wider relative group py-2"
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-coffee-900 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/locations"
              className="text-coffee-700 hover:text-coffee-900 transition-all font-light text-sm uppercase tracking-wider relative group py-2"
            >
              Locations
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-coffee-900 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/contact"
              className="text-coffee-700 hover:text-coffee-900 transition-all font-light text-sm uppercase tracking-wider relative group py-2"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-coffee-900 transition-all group-hover:w-full"></span>
            </Link>

            {/* Cart with Badge */}
            <Link
              href="/cart"
              className="relative text-coffee-700 hover:text-coffee-900 transition-all font-light text-sm uppercase tracking-wider group py-2"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-coffee-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-coffee-900 transition-all group-hover:w-full"></span>
            </Link>

            {session ? (
              <div className="flex items-center gap-6 border-l border-coffee-200 pl-6">
                <Link
                  href="/account"
                  className="text-coffee-700 hover:text-coffee-900 transition-all font-light text-sm uppercase tracking-wider relative group py-2"
                >
                  Account
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-coffee-900 transition-all group-hover:w-full"></span>
                </Link>

                {(session.user as any)?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-coffee-700 hover:text-coffee-900 transition-all font-light text-sm uppercase tracking-wider relative group py-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin
                    </div>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-coffee-900 transition-all group-hover:w-full"></span>
                  </Link>
                )}

                <button
                  onClick={() => signOut()}
                  className="px-5 py-2 border border-coffee-300 text-coffee-700 hover:bg-coffee-900 hover:text-white hover:border-coffee-900 transition-all font-light text-sm uppercase tracking-wider"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 border-l border-coffee-200 pl-6">
                <Link
                  href="/auth/signin"
                  className="text-coffee-700 hover:text-coffee-900 transition-all font-light text-sm uppercase tracking-wider relative group py-2"
                >
                  Sign In
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-coffee-900 transition-all group-hover:w-full"></span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-coffee-800 text-white px-6 py-2.5 hover:bg-coffee-900 transition-all font-light text-sm uppercase tracking-wider shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-coffee-900 p-2 hover:bg-coffee-50 rounded transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 pb-6" : "max-h-0"
          }`}
        >
          <div className="space-y-3 pt-4 border-t border-coffee-200">
            {session && (
              <div className="px-4 py-3 bg-coffee-50 rounded-lg mb-4">
                <p className="text-xs text-coffee-500">Signed in as</p>
                <p className="text-sm font-medium text-coffee-900">
                  {session.user?.name || session.user?.email}
                </p>
              </div>
            )}

            <Link
              href="/#products"
              className="flex items-center gap-3 px-4 py-3 text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors font-light"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Products
            </Link>

            <Link
              href="/locations"
              className="flex items-center gap-3 px-4 py-3 text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors font-light"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Locations
            </Link>

            <Link
              href="/contact"
              className="flex items-center gap-3 px-4 py-3 text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors font-light"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-3 px-4 py-3 text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors font-light"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="ml-auto bg-coffee-800 text-white text-xs rounded-full px-2 py-0.5">
                  {cartCount}
                </span>
              )}
            </Link>

            {session ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-4 py-3 text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors font-light"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Account
                </Link>

                {(session.user as any)?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors font-light"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors font-light text-left"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-3 pt-3 border-t border-coffee-200">
                <Link
                  href="/auth/signin"
                  className="block px-4 py-3 text-center border border-coffee-300 text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors font-light"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-3 text-center bg-coffee-800 text-white hover:bg-coffee-900 rounded-lg transition-colors font-light"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
