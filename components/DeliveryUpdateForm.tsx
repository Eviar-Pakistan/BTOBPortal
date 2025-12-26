"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderItem, DeliveryStatus } from "@prisma/client";
import { Product } from "@prisma/client";

interface DeliveryUpdateFormProps {
  orderItem: OrderItem & { product: Product };
}

export function DeliveryUpdateForm({ orderItem }: DeliveryUpdateFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<DeliveryStatus>(orderItem.deliveryStatus);
  const [comments, setComments] = useState(orderItem.deliveryComments || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/items/${orderItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryStatus: status,
          deliveryComments: comments,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update delivery status");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update delivery status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 ">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
            className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-md"
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Comments
          </label>
          <input
            type="text"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add delivery notes..."
            className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-accent text-white hover:bg-accent-dark disabled:opacity-50 text-sm font-medium rounded-full"
        >
          {isSubmitting ? "Updating..." : "Update"}
        </button>
      </div>
    </form>
  );
}

