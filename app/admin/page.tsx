import { Navbar } from "@/components/Navbar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { AdminPanel } from "@/components/AdminPanel";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const categories = await (prisma as any).category.findMany({
    orderBy: { name: "asc" },
  });

  const leftovers = await (prisma as any).leftOver.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          productNumber: true,
          stock: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-reveal">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-600">
            Manage products, categories, pricing, and inventory.
          </p>
        </div>

        <AdminPanel products={products} categories={categories} leftovers={leftovers} />
      </main>
    </div>
  );
}

