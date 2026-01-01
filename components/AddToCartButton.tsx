"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@prisma/client";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product.colorVariants[0] || "Default"
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (product.stock < quantity) {
      alert("Insufficient stock");
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      productNumber: (product as any).productNumber || "",
      price: product.price,
      quantity,
      colorVariant: selectedColor,
      image: product.images[0] || "",
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="space-y-4">
      {product.colorVariants.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Color:</p>
          <div className="flex gap-2">
            {product.colorVariants.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 border-2 rounded-full ${
                  selectedColor === color
                    ? "border-accent bg-accent text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-accent"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-full">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full"
            disabled={quantity <= 1}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
            className="w-16 text-center border-0 focus:outline-none"
          />
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full"
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1 bg-accent text-white px-6 py-3 font-medium hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed border border-accent rounded-full"
        >
          {showSuccess ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

