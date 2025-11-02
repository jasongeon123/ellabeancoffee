"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageGallery from "./ImageGallery";

export default function ProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    inStock: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (response.ok) {
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "",
          image: "",
          inStock: true,
        });
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
            placeholder="e.g., Coffee Beans, Espresso, etc."
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
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500 mt-2"
            placeholder="Or enter path manually: /1.jpg"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="inStock"
          checked={formData.inStock}
          onChange={(e) =>
            setFormData({ ...formData, inStock: e.target.checked })
          }
          className="mr-2"
        />
        <label htmlFor="inStock" className="text-sm text-coffee-900">
          In Stock
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-coffee-800 text-white py-3 hover:bg-coffee-900 transition-colors disabled:opacity-50 uppercase text-sm tracking-wide"
      >
        {loading ? "Adding Product..." : "Add Product"}
      </button>
    </form>
  );
}
