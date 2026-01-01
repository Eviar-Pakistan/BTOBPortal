"use client";

import { Navbar } from "@/components/Navbar";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { GenerateQuotationButton } from "@/components/GenerateQuotationButton";
import { PlaceOrderButton } from "@/components/PlaceOrderButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Role } from "@prisma/client";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    
    if (!session?.user || session.user.role !== Role.USER) {
      router.push("/");
    }
  }, [session, status, router]);

  // Show nothing while checking or redirecting
  if (status === "loading" || !session?.user || session.user.role !== Role.USER) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-reveal">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Shopping Cart</h1>
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm py-12 flex flex-col items-center justify-center gap-4">
            <p className="text-slate-500">Your cart is empty.</p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Browse products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-reveal">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.colorVariant}`}
                className="rounded-3xl border border-slate-100 bg-white shadow-sm p-4"
              >
                <div className="flex gap-4">
                  {item.image && (
                    <div className="w-24 h-24 bg-slate-50 flex-shrink-0 rounded-2xl overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-500">Color: {item.colorVariant}</p>
                    <p className="text-lg font-bold text-emerald-700 mt-2">
                      PKR {item.price.toFixed(0)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center rounded-full border border-slate-200 overflow-hidden bg-slate-50">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.colorVariant, item.quantity - 1)
                        }
                        className="px-3 py-1 hover:bg-slate-200"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 min-w-[3rem] text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.colorVariant, item.quantity + 1)
                        }
                        className="px-3 py-1 hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      PKR {(item.price * item.quantity).toFixed(0)}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId, item.colorVariant)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">PKR {getTotal().toFixed(0)}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-emerald-700">PKR {getTotal().toFixed(0)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <GenerateQuotationButton items={items} />
                <PlaceOrderButton items={items} total={getTotal()} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

