"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Role } from "@prisma/client";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";


let cachedCategories: { name: string }[] | null = null;


export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [CategoriesData, setCategories] = useState<{ name: string }[]>(
    cachedCategories || []
  );
  useEffect(() => {

     if (cachedCategories) {
      setCategories(cachedCategories);
      return;
    }
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
        cachedCategories = data;
  

       
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);


  let navigation: { name: string; href: string }[] = [];

  CategoriesData.forEach((category: { name: string }) => {
    navigation.push({
      name: category.name,
      href: `/products/${category.name.toLowerCase()}`,
    });
  });

  return (
    <nav className="bg-gradient-to-r from-[#CCBE1A] to-[#788F35] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={logo}
                alt="B2B Portal logo"
                width={140}
                height={40}
                className="h-16 w-auto object-contain"
                priority
              />
            </Link>

            <Link href="/" className={`px-3 py-2 text-sm font-medium rounded-full transition-colors ${pathname === "/"
                      ? "bg-white/95 text-[#4b5b1f]"
                      : "hover:bg-white/15"
                    }`}>
              Home
            </Link>

            <Link href="/products" className={`px-3 py-2 text-sm font-medium rounded-full transition-colors ${pathname === "/products"
                      ? "bg-white/95 text-[#4b5b1f]"
                      : "hover:bg-white/15"
                    }`}>
              Products
            </Link>

            <Link href="/leftovers" className={`px-3 py-2 text-sm font-medium rounded-full transition-colors ${pathname === "/leftovers"
                      ? "bg-white/95 text-[#4b5b1f]"
                      : "hover:bg-white/15"
                    }`}>
              Leftovers
            </Link>

            {/* <div className="hidden md:flex md:ml-8 md:space-x-4 border-2 border-red-500">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-full transition-colors ${pathname === item.href
                      ? "bg-white/95 text-[#4b5b1f]"
                      : "hover:bg-white/15"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div> */}

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-3 py-2 text-sm font-medium rounded-full transition-colors hover:bg-white/15"
              >
                Categories
              </button>
              {dropdownOpen && (
                <div className="absolute top-10 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-3">
            {session?.user.role === Role.ADMIN && (
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-medium rounded-full hover:bg-white/15"
              >
                Admin
              </Link>
            )}
            {session?.user.role === Role.DELIVERY && (
              <Link
                href="/delivery"
                className="px-4 py-2 text-sm font-medium rounded-full hover:bg-white/15"
              >
                Delivery
              </Link>
            )}

            {session?.user.role === Role.USER && ( <Link
                href="/orders"
                className="px-4 py-2 text-sm font-medium rounded-full hover:bg-white/15"
              >
                Orders
              </Link>)}
             
            {session && (
              <span className="text-sm hidden lg:inline">{session.user.email}</span>
            )}
            {!session && (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium hover:bg-accent-light"
              >
                Login
              </Link>
            )}
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-white/15 relative"
              aria-label="Shopping cart"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#4b5b1f] text-xs font-bold w-5 h-5 flex items-center justify-center border border-white/70 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            {session && (
              <button
                onClick={() => signOut()}
                className="p-2 rounded-full hover:bg-white/15"
                aria-label="Logout"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {session && (
              <button
                onClick={() => signOut()}
                className="p-2 rounded-full hover:bg-white/15"
                aria-label="Logout"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-white/15 relative"
              aria-label="Shopping cart"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#4b5b1f] text-xs font-bold w-5 h-5 flex items-center justify-center border border-white/70 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-white/15"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
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
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-accent-light">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium ${pathname === "/"
                    ? "bg-white text-accent"
                    : "hover:bg-accent-light"
                  }`}
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium ${pathname === "/products"
                    ? "bg-white text-accent"
                    : "hover:bg-accent-light"
                  }`}
              >
                Products
              </Link>
              <Link
                href="/leftovers"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium ${pathname === "/leftovers"
                    ? "bg-white text-accent"
                    : "hover:bg-accent-light"
                  }`}
              >
                Leftovers
              </Link>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium ${pathname === item.href
                      ? "bg-white text-accent"
                      : "hover:bg-accent-light"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
              {session?.user.role === Role.ADMIN && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium hover:bg-accent-light"
                >
                  Admin
                </Link>
              )}
              {session?.user.role === Role.DELIVERY && (
                <Link
                  href="/delivery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium hover:bg-accent-light"
                >
                  Delivery
                </Link>
              )}
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium hover:bg-accent-light"
              >
                Orders
              </Link>
              {session ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-200 border-t border-accent-light mt-2 pt-2">
                    {session.user.email}
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium hover:bg-accent-light"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium hover:bg-accent-light"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

