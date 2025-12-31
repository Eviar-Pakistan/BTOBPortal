"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").refine(
    (val) => val.charAt(0) === val.charAt(0).toUpperCase(),
    "Name must start with an uppercase letter"
  ),
  
  description: z.string().min(1, "Description is required"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  description: string;
}

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          description: category.description,
        }
      : undefined,
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const url = category ? `/api/categories/${category.id}` : "/api/categories";
      const method = category ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${category ? "update" : "create"} category`);
      }

      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message || `Failed to ${category ? "update" : "create"} category`);
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
          Category Name It should be one word and start with an uppercase letter *
        </label>
        <input
          {...register("name")}
          className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 rounded-full"
          placeholder="e.g., Electronics"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 rounded-2xl resize-none"
          placeholder="Enter category description..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-6 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? category
              ? "Updating..."
              : "Creating..."
            : category
            ? "Update Category"
            : "Create Category"}
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

