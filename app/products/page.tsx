import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

// Render this page dynamically so Prisma runs at request time, not during build
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-reveal">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">All Products</h1>
            <p className="text-sm text-slate-600">
              Browse the full catalog of items available for quotations and orders.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold">{products.length}</span> products
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {product.images[0] && (
                <div className="aspect-[4/3] bg-transparent relative overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="text-xs font-medium text-lime-700 mb-1 uppercase tracking-wide">
                  {product.category || "Product"}
                </p>
                <p className="text-xs text-slate-600 mb-1 font-medium">
                  {(product as any).productNumber || ""}
                </p>
                <h3 className="font-semibold text-base text-slate-900 mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-lg font-bold text-emerald-700">
                    PKR {product.price.toFixed(0)}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-semibold ${
                      product.stock > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No products found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

