"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const leftoverSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  custodianName: z.string().min(1, "Custodian name is required"),
  custodianLocation: z.string().min(1, "Custodian location is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

type LeftOverFormData = z.infer<typeof leftoverSchema>;

interface Product {
  id: string;
  name: string;
  stock: number;
}

interface LeftOver {
  id: string;
  productId: string;
  custodianName: string;
  custodianLocation: string;
  quantity: number;
  product: Product;
}

interface LeftOverFormProps {
  leftover?: LeftOver;
}

export function LeftOverForm({ leftover }: LeftOverFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [maxQuantity, setMaxQuantity] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LeftOverFormData>({
    resolver: zodResolver(leftoverSchema),
    defaultValues: leftover
      ? {
          productId: leftover.productId,
          custodianName: leftover.custodianName,
          custodianLocation: leftover.custodianLocation,
          quantity: leftover.quantity,
        }
      : undefined,
  });

  const watchedProductId = watch("productId");

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
        
        // Set selected product if editing
        if (leftover) {
          const product = data.find((p: Product) => p.id === leftover.productId);
          if (product) {
            setSelectedProduct(product);
            // For editing: available stock = current stock + existing leftover quantity
            setMaxQuantity(product.stock + leftover.quantity);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, [leftover]);

  // Update max quantity when product changes
  useEffect(() => {
    if (watchedProductId) {
      const product = products.find((p) => p.id === watchedProductId);
      if (product) {
        setSelectedProduct(product);
        if (leftover && leftover.productId === watchedProductId) {
          // Same product: available = current stock + existing leftover quantity
          setMaxQuantity(product.stock + leftover.quantity);
        } else {
          // Different product or new leftover: available = current stock
          setMaxQuantity(product.stock);
        }
      }
    }
  }, [watchedProductId, products, leftover]);

  const onSubmit = async (data: LeftOverFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      // Validate quantity
      // if (data.quantity > maxQuantity) {
      //   throw new Error(`Quantity cannot exceed available stock (${maxQuantity})`);
      // }

      const url = leftover ? `/api/leftovers/${leftover.id}` : "/api/leftovers";
      const method = leftover ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${leftover ? "update" : "create"} leftover`);
      }

      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message || `Failed to ${leftover ? "update" : "create"} leftover`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product *
        </label>
        <select
          {...register("productId")}
          className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 rounded-full"
          disabled={isSubmitting}
        >
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} (Stock: {product.stock})
            </option>
          ))}
        </select>
        {errors.productId && (
          <p className="text-red-500 text-sm mt-1">{errors.productId.message}</p>
        )}
        {selectedProduct && (
          <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm">
            <p className="font-semibold text-slate-900">{selectedProduct.name}</p>
            <p className="text-slate-600">Available Stock: {maxQuantity}</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custodian Name *
        </label>
        <input
          {...register("custodianName")}
          className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 rounded-full"
          placeholder="Enter custodian name"
        />
        {errors.custodianName && (
          <p className="text-red-500 text-sm mt-1">{errors.custodianName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custodian Location *
        </label>
        <input
          {...register("custodianLocation")}
          className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 rounded-full"
          placeholder="Enter custodian location"
        />
        {errors.custodianLocation && (
          <p className="text-red-500 text-sm mt-1">{errors.custodianLocation.message}</p>
        )}
      </div>

      <div>
        {/* <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity * (Max: {maxQuantity})
        </label> */}
         <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity
        </label>
        <input
          type="number"
          min="1"
          {...register("quantity", { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 rounded-full"
          placeholder="Enter quantity"
        />
        {errors.quantity && (
          <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
        )}
        {/* {maxQuantity > 0 && (
          <p className="text-sm text-slate-500 mt-1">
            Maximum available: {maxQuantity} units
          </p>
        )} */}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting || maxQuantity === 0}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-6 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? leftover
              ? "Updating..."
              : "Creating..."
            : leftover
            ? "Update LeftOver"
            : "Create LeftOver"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 px-6 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

