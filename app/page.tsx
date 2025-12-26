import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="glass-panel grid grid-cols-1 lg:grid-cols-2 gap-10 items-center p-8 lg:p-12 scroll-reveal">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-lime-700 mb-3">
                B2B SHOPPING
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-4 text-balance">
                Shopping and{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-700 to-amber-500">
                 Cataloging Tool
                </span>
                .
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mb-6 max-w-xl">
                Discover curated products for your business with fast quotation, bulk pricing,
                and reliable delivery support.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
                >
                  Browse Products
                </Link>
                <Link
                  href="/orders"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-900 hover:border-slate-300 hover:bg-white transition-colors"
                >
                  View Orders
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm text-slate-700">
                <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm border border-white/60">
                  <p className="font-semibold">Fast Quotes</p>
                  <p className="text-xs text-slate-500">Generate in a few clicks.</p>
                </div>
                <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm border border-white/60">
                  <p className="font-semibold">Bulk Pricing</p>
                  <p className="text-xs text-slate-500">Optimized for B2B deals.</p>
                </div>
                <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm border border-white/60">
                  <p className="font-semibold">Trusted Delivery</p>
                  <p className="text-xs text-slate-500">Track and manage shipments.</p>
                </div>
              </div>
            </div>

            <div className="relative h-72 sm:h-80 lg:h-[360px]">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/90 via-white/60 to-amber-100 shadow-2xl overflow-hidden flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 p-6">
                  {featuredProducts.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group rounded-3xl bg-white/90 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      {product.images[0] && (
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="px-3 pb-3 pt-2">
                        <p className="text-[0.68rem] font-medium text-slate-500 line-clamp-1">
                          {product.category || "Featured"}
                        </p>
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs font-bold text-emerald-700 mt-1">
                          PKR {product.price.toFixed(0)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured products grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 scroll-reveal">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
              <p className="text-sm text-slate-600">
                Handpicked items that buyers are loving right now.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-900 hover:border-slate-300 hover:bg-white transition-colors"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative rounded-3xl bg-white/90 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden scroll-reveal"
              >
                {product.images[0] && (
                  <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs font-medium text-lime-700 mb-1 uppercase tracking-wide">
                    {product.category || "Featured"}
                  </p>
                  <h3 className="font-semibold text-base text-slate-900 mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-emerald-700">
                      PKR {product.price.toFixed(0)}
                    </p>
                    <span className="inline-flex items-center rounded-full bg-slate-900 text-white text-[0.7rem] font-semibold px-3 py-1 group-hover:bg-slate-800 transition-colors">
                      Add to cart
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Category quick links */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-reveal">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Shop by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/products"
              className="rounded-3xl bg-white/90 border border-slate-100 px-5 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
            >
              <span className="text-sm font-semibold text-slate-900 mb-1">All Products</span>
              <span className="text-xs text-slate-500">View complete catalog</span>
            </Link>
            <Link
              href="/products/drinkware"
              className="rounded-3xl bg-white/90 border border-slate-100 px-5 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
            >
              <span className="text-sm font-semibold text-slate-900 mb-1">Drinkware</span>
              <span className="text-xs text-slate-500">Mugs, bottles & more</span>
            </Link>
            <Link
              href="/products/electronics"
              className="rounded-3xl bg-white/90 border border-slate-100 px-5 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
            >
              <span className="text-sm font-semibold text-slate-900 mb-1">Electronics</span>
              <span className="text-xs text-slate-500">Tech for every desk</span>
            </Link>
            <Link
              href="/products/accessories"
              className="rounded-3xl bg-white/90 border border-slate-100 px-5 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
            >
              <span className="text-sm font-semibold text-slate-900 mb-1">Accessories</span>
              <span className="text-xs text-slate-500">Gifts & merch</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/40 backdrop-blur-md bg-gradient-to-r from-[#CCBE1A] to-[#788F35] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm ">
          <div className="flex items-center gap-2">
            <span className="font-semibold ">B2B Portal</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <span>Support: support@example.com</span>
            <span className="hidden sm:inline-block">Delivery within 3–5 business days.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

