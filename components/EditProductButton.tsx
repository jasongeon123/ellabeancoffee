"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageGallery from "./ImageGallery";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  roastLevel?: string | null;
  origin?: string | null;
  tastingNotes?: string[];
  brewingMethods?: string[];
}

export default function EditProductButton({ product }: { product: Product }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    category: product.category,
    image: product.image,
    inStock: product.inStock,
    roastLevel: product.roastLevel || "",
    origin: product.origin || "",
    tastingNotes: product.tastingNotes?.join(", ") || "",
    brewingMethods: product.brewingMethods?.join(", ") || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          roastLevel: formData.roastLevel || null,
          origin: formData.origin || null,
          tastingNotes: formData.tastingNotes ? formData.tastingNotes.split(',').map(n => n.trim()).filter(n => n) : [],
          brewingMethods: formData.brewingMethods ? formData.brewingMethods.split(',').map(m => m.trim()).filter(m => m) : [],
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-coffee-700 hover:text-coffee-900 text-sm px-4 py-2 border border-coffee-300 hover:bg-coffee-50"
      >
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-coffee-900">
                Edit Product
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-coffee-600 hover:text-coffee-900 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    Product Image
                  </label>
                  <ImageGallery
                    onSelect={(path) => setFormData({ ...formData, image: path })}
                    currentImage={formData.image}
                  />
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500 mt-2"
                    placeholder="Or enter path manually"
                  />
                </div>
              </div>

              {/* Coffee-Specific Details */}
              <div className="border-t border-coffee-200 pt-4 mt-4">
                <h3 className="text-lg font-medium text-coffee-900 mb-4">Coffee Details (Optional)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      Roast Level
                    </label>
                    <select
                      value={formData.roastLevel}
                      onChange={(e) => setFormData({ ...formData, roastLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
                    >
                      <option value="">Select roast level</option>
                      <option value="Light">Light</option>
                      <option value="Medium">Medium</option>
                      <option value="Medium-Dark">Medium-Dark</option>
                      <option value="Dark">Dark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      Origin/Region
                    </label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
                      placeholder="e.g., Colombia, Ethiopia, Brazil"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    Tasting Notes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tastingNotes}
                    onChange={(e) => setFormData({ ...formData, tastingNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
                    placeholder="e.g., chocolate, nutty, caramel, fruity"
                  />
                  <p className="text-xs text-coffee-500 mt-1">Enter flavor notes separated by commas</p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-coffee-900 mb-2">
                    Recommended Brewing Methods (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.brewingMethods}
                    onChange={(e) => setFormData({ ...formData, brewingMethods: e.target.value })}
                    className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
                    placeholder="e.g., Pour Over, French Press, Espresso"
                  />
                  <p className="text-xs text-coffee-500 mt-1">Enter brewing methods separated by commas</p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock-edit"
                  checked={formData.inStock}
                  onChange={(e) =>
                    setFormData({ ...formData, inStock: e.target.checked })
                  }
                  className="mr-2"
                />
                <label htmlFor="inStock-edit" className="text-sm text-coffee-900">
                  In Stock
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-coffee-800 text-white py-3 hover:bg-coffee-900 transition-colors disabled:opacity-50 uppercase text-sm tracking-wide"
                >
                  {loading ? "Updating..." : "Update Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 border border-coffee-300 hover:bg-coffee-50 transition-colors uppercase text-sm tracking-wide"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
