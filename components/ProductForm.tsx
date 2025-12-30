"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock must be non-negative"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["local", "import"], {
    required_error: "Type is required",
  }),
  images: z.array(z.string()).min(1, "At least one image is required"),
  colorVariants: z.array(z.string()).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
}

let cachedCategories: { name: string }[] | null = null;

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images || []);
  const [colorVariants, setColorVariants] = useState<string[]>(
    product?.colorVariants || []
  );
  const [newColor, setNewColor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [CategoriesData, setCategories] = useState<{ name: string }[]>(
    cachedCategories || []
  );
  

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category as any,
          location: (product as any).location || "",
          type: (product as any).type || "local",
          images: product.images,
          colorVariants: product.colorVariants,
        }
      : undefined,
  });

  useEffect(() => {
    setValue("images", imageUrls);
  }, [imageUrls, setValue]);

  useEffect(() => {
    setValue("colorVariants", colorVariants);
  }, [colorVariants, setValue]);


  useEffect(() => {

    if (cachedCategories) {
     setCategories(cachedCategories);
     return;
   }
   async function fetchCategories() {
     try {
       const response = await fetch("/api/categories");
       if (!response.ok) {
         throw new Error("Failed to fetch categories");
       }
       const data = await response.json();
       setCategories(data);
       cachedCategories = data;
      
     } catch (error) {
       console.error("Error fetching categories:", error);
     }
   }
   fetchCategories();
 }, []);


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload images");
      }

      const data = await response.json();
      setImageUrls([...imageUrls, ...data.urls]);
    } catch (err: any) {
      setError(err.message || "Failed to upload images");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const addColorVariant = () => {
    if (newColor.trim() && !colorVariants.includes(newColor.trim())) {
      setColorVariants([...colorVariants, newColor.trim()]);
      setNewColor("");
    }
  };

  const removeColorVariant = (color: string) => {
    setColorVariants(colorVariants.filter((c) => c !== color));
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images: imageUrls,
          colorVariants: colorVariants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Name *
        </label>
        <input
          {...register("name")}
          className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
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
          className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-md"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
          <input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
          <input
            type="number"
            {...register("stock", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
          />
          {errors.stock && (
            <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <select
            {...register("category")}
            className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
          >
            {CategoriesData.map((category) => (
              <option key={category.name} value={category.name}>{category.name}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
          <select
            {...register("type")}
            className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
          >
            <option value="local">Local</option>
            <option value="import">Import</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
        <input
          {...register("location")}
          className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
          placeholder="Enter product location"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images * (Upload files)
        </label>
        
        {/* Image upload input */}
        <div className="mb-4">
          <label className="block">
            <span className="sr-only">Choose image files</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>
          {uploading && (
            <p className="text-sm text-gray-600 mt-2">Uploading images...</p>
          )}
        </div>

        {/* Preview uploaded images */}
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 border border-gray-300 overflow-hidden">
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImageUrl(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.images && (
          <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
        )}
        {imageUrls.length === 0 && !uploading && (
          <p className="text-sm text-gray-500 mt-2">
            Upload at least one image for the product
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color Variants
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColorVariant();
              }
            }}
            placeholder="Enter color name"
            className="flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent rounded-full"
          />
          <button
            type="button"
            onClick={addColorVariant}
            className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-full"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {colorVariants.map((color) => (
            <span
              key={color}
              className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-white"
            >
              {color}
              <button
                type="button"
                onClick={() => removeColorVariant(color)}
                className="hover:text-gray-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-accent text-white hover:bg-accent-dark disabled:opacity-50 rounded-full"
        >
          {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

