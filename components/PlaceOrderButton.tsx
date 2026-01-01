"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CartItem, useCartStore } from "@/store/cartStore";

interface PlaceOrderButtonProps {
  items: CartItem[];
  total: number;
}

export function PlaceOrderButton({ items, total }: PlaceOrderButtonProps) {
  const { data: session } = useSession();
  const clearCart = useCartStore((state) => state.clearCart);
  const [showModal, setShowModal] = useState(false);
  const [poNumber, setPoNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poNumber.trim()) {
      setError("PO Number is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: poNumber.trim(),
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            colorVariant: item.colorVariant,
          })),
          totalAmount: total,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to place order");
      }

      clearCart();
      // Force full page reload to ensure fresh data is fetched
      window.location.href = "/orders";
    } catch (err: any) {
      setError(err.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-accent text-white py-3 px-4 font-medium hover:bg-accent-dark rounded-full"
      >
        Place Order
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Place Order</h2>
            <form onSubmit={handlePlaceOrder}>
              <div className="mb-4">
                <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Order (PO) Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="poNumber"
                  type="text"
                  value={poNumber}
                  onChange={(e) => {
                    setPoNumber(e.target.value);
                    setError("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                  placeholder="Enter PO Number"
                  required
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPoNumber("");
                    setError("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent text-white px-4 py-2 hover:bg-accent-dark disabled:opacity-50"
                >
                  {isSubmitting ? "Placing Order..." : "Confirm Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

