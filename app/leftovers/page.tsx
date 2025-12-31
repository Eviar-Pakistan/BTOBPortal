import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Render this page dynamically so Prisma runs at request time, not during build
export const dynamic = "force-dynamic";

export default async function LeftoversPage() {
  const leftovers = await (prisma as any).leftOver.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          category: true,
          images: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-reveal">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Leftover Products</h1>
            <p className="text-sm text-slate-600">
              Browse leftover products available for purchase.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold">{leftovers.length}</span> leftover items
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leftovers.map((leftover: any) => (
            <div
              key={leftover.id}
              className="group relative rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {leftover.product.images[0] && (
                <div className="aspect-[4/3] bg-transparent relative overflow-hidden">
                  <img
                    src={leftover.product.images[0]}
                    alt={leftover.product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="text-xs font-medium text-lime-700 mb-1 uppercase tracking-wide">
                  {leftover.product.category || "Product"}
                </p>
                <h3 className="font-semibold text-base text-slate-900 mb-1 line-clamp-1">
                  {leftover.product.name}
                </h3>
                <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                  {leftover.product.description}
                </p>
                
                <div className="mb-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Quantity:</span>
                    <span className="font-semibold text-slate-900">{leftover.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Custodian:</span>
                    <span className="font-semibold text-slate-900 truncate ml-2">{leftover.custodianName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Location:</span>
                    <span className="font-semibold text-slate-900 truncate ml-2">{leftover.custodianLocation}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <p className="text-lg font-bold text-emerald-700">
                    PKR {leftover.product.price.toFixed(0)}
                  </p>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.7rem] font-semibold bg-blue-50 text-blue-700">
                    Leftover
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {leftovers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No leftover products found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

