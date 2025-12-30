import { Navbar } from "@/components/Navbar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { LeftOverForm } from "@/components/LeftOverForm";

export default async function EditLeftOverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  const { id } = await params;
  const leftover = await (prisma as any).leftOver.findUnique({
    where: { id },
    include: {
      product: true,
    },
  });

  if (!leftover) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit LeftOver</h1>
        <LeftOverForm leftover={leftover as any} />
      </main>
    </div>
  );
}

