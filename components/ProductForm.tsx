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
    stockQuantity: "",
    lowStockAlert: "",
    roastLevel: "",
    origin: "",
    tastingNotes: "",
    brewingMethods: "",
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
          stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : null,
          lowStockAlert: formData.lowStockAlert ? parseInt(formData.lowStockAlert) : null,
          roastLevel: formData.roastLevel || null,
          origin: formData.origin || null,
          tastingNotes: formData.tastingNotes ? formData.tastingNotes.split(',').map(n => n.trim()).filter(n => n) : [],
          brewingMethods: formData.brewingMethods ? formData.brewingMethods.split(',').map(m => m.trim()).filter(m => m) : [],
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
          stockQuantity: "",
          lowStockAlert: "",
          roastLevel: "",
          origin: "",
          tastingNotes: "",
          brewingMethods: "",
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-2">
            Stock Quantity (optional)
          </label>
          <input
            type="number"
            min="0"
            value={formData.stockQuantity}
            onChange={(e) =>
              setFormData({ ...formData, stockQuantity: e.target.value })
            }
            className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
            placeholder="Leave empty for unlimited"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-2">
            Low Stock Alert (optional)
          </label>
          <input
            type="number"
            min="0"
            value={formData.lowStockAlert}
            onChange={(e) =>
              setFormData({ ...formData, lowStockAlert: e.target.value })
            }
            className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
            placeholder="Alert when below this number"
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
