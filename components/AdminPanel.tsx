"use client";

import { useState } from "react";
import Link from "next/link";
import { DeleteProductButton } from "./DeleteProductButton";
import { DeleteCategoryButton } from "./DeleteCategoryButton";
import { DeleteLeftOverButton } from "./DeleteLeftOverButton";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  location: string;
  type: string;
  images: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface LeftOver {
  id: string;
  productId: string;
  custodianName: string;
  custodianLocation: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    stock: number;
  };
}

interface AdminPanelProps {
  products: Product[];
  categories: Category[];
  leftovers: LeftOver[];
}

export function AdminPanel({ products, categories, leftovers }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "leftovers">("products");

  return (
    <div className="flex gap-6">
      {/* Side Panel */}
      <aside className="w-64 flex-shrink-0">
        <nav className="bg-white border border-slate-200 rounded-2xl p-2">
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === "products"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors mt-2 ${
              activeTab === "categories"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("leftovers")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors mt-2 ${
              activeTab === "leftovers"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            LeftOver
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Products</h2>
                <p className="text-sm text-slate-600">
                  Manage products, pricing, and inventory.
                </p>
              </div>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center rounded-full bg-slate-900 text-white px-6 py-2 text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Add new product
              </Link>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full table-fixed">
                <thead className="bg-slate-900 text-white text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium w-24">Image</th>
                    <th className="px-6 py-3 text-left font-medium w-64">Name</th>
                    <th className="px-6 py-3 text-left font-medium w-32">Category</th>
                    <th className="px-6 py-3 text-left font-medium w-32">Price</th>
                    <th className="px-6 py-3 text-left font-medium w-24">Stock</th>
                    <th className="px-6 py-3 text-left font-medium w-32">Type</th>
                    <th className="px-6 py-3 text-left font-medium w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 whitespace-nowrap w-24">
                        {product.images[0] ? (
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top w-64">
                        <div className="text-sm font-semibold text-slate-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-2">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 w-32">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 w-32">
                        PKR {product.price.toFixed(0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 w-24">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 w-32">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 capitalize">
                          {product.type || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3 w-32">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-slate-900 hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton productId={product.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                <p className="text-slate-500">No products found.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
                <p className="text-sm text-slate-600">
                  Manage product categories.
                </p>
              </div>
              <Link
                href="/admin/categories/new"
                className="inline-flex items-center rounded-full bg-slate-900 text-white px-6 py-2 text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Add new category
              </Link>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full table-fixed">
                <thead className="bg-slate-900 text-white text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium w-64">Name</th>
                    <th className="px-6 py-3 text-left font-medium">Description</th>
                    <th className="px-6 py-3 text-left font-medium w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 whitespace-nowrap w-64">
                        <div className="text-sm font-semibold text-slate-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-slate-700">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3 w-32">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-slate-900 hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteCategoryButton categoryId={category.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                <p className="text-slate-500">No categories found.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "leftovers" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">LeftOver</h2>
                <p className="text-sm text-slate-600">
                  Manage leftover products.
                </p>
              </div>
              <Link
                href="/admin/leftovers/new"
                className="inline-flex items-center rounded-full bg-slate-900 text-white px-6 py-2 text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Add new LeftOver
              </Link>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full table-fixed">
                <thead className="bg-slate-900 text-white text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium w-64">Product</th>
                    <th className="px-6 py-3 text-left font-medium w-48">Custodian Name</th>
                    <th className="px-6 py-3 text-left font-medium w-48">Custodian Location</th>
                    <th className="px-6 py-3 text-left font-medium w-32">Quantity</th>
                    <th className="px-6 py-3 text-left font-medium w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {leftovers.map((leftover) => (
                    <tr key={leftover.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 align-top w-64">
                        <div className="text-sm font-semibold text-slate-900">
                          {leftover.product.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Stock: {leftover.product.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 w-48">
                        {leftover.custodianName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 w-48">
                        {leftover.custodianLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 w-32">
                        {leftover.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3 w-32">
                        <Link
                          href={`/admin/leftovers/${leftover.id}/edit`}
                          className="text-slate-900 hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteLeftOverButton leftoverId={leftover.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {leftovers.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                <p className="text-slate-500">No leftovers found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

