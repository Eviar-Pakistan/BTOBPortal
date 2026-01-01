import { Navbar } from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import Link from "next/link";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idLower = id.toLowerCase();

  // Fetch categories from database
  const categoriesData = await (prisma as any).category.findMany({
    select: {
      name: true,
    },
  });
  const categories = categoriesData.map((category: { name: string }) => category.name.toLowerCase());

  // Check if it's a category first (case-insensitive comparison)
  if (categories.includes(idLower)) {
    // Render category page
    const products = await prisma.product.findMany({
      where: {
        category: idLower.charAt(0).toUpperCase() + idLower.slice(1),
      },
      orderBy: { createdAt: "desc" },
    });

    const categoryTitle =
      idLower.charAt(0).toUpperCase() + idLower.slice(1);

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-reveal">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{categoryTitle}</h1>
              <p className="text-sm text-slate-600">
                Products curated under the {categoryTitle.toLowerCase()} category.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold">{products.length}</span> items
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
                    {product.category || categoryTitle}
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
              <p className="text-slate-500">No products found in this category.</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Otherwise, treat it as a product ID
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            {product.images[0] && (
              <div className="aspect-square bg-slate-50 relative overflow-hidden rounded-[1.75rem] border border-slate-100 shadow-sm">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-slate-50 relative overflow-hidden rounded-2xl border border-slate-100"
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 lg:p-8">
            <p className="text-xs font-medium text-lime-700 mb-2 uppercase tracking-[0.25em]">
              {product.category || "Product"}
            </p>
            <p className="text-sm text-slate-600 mb-2 font-medium">
              Product Number: {(product as any).productNumber || ""}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              {product.name}
            </h1>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-6">
              PKR {product.price.toFixed(0)}
            </p>

            <div className="mb-6 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {product.description}
            </div>

            <div className="mb-4 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                Category: <span className="ml-1 font-semibold">{product.category}</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                Location: <span className="ml-1 font-semibold">{(product as any).location || "N/A"}</span>
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ${
                  product.stock > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {product.stock > 0 ? `In stock: ${product.stock} units` : "Out of stock"}
              </span>
            </div>

            <AddToCartButton product={product} />
          </div>
        </div>
      </main>
    </div>
  );
}

