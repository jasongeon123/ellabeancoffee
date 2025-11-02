"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LocationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    date: "",
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (response.ok) {
        setFormData({
          title: "",
          description: "",
          address: "",
          date: "",
          active: true,
        });
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create location:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-coffee-900 mb-2">
          Title
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
          placeholder="e.g., Downtown Farmers Market"
        />
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
          placeholder="Brief description of the event or location"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-coffee-900 mb-2">
          Address
        </label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
          placeholder="123 Main St, City, State"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-coffee-900 mb-2">
          Date & Time
        </label>
        <input
          type="datetime-local"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-coffee-300 focus:outline-none focus:border-coffee-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) =>
            setFormData({ ...formData, active: e.target.checked })
          }
          className="mr-2"
        />
        <label htmlFor="active" className="text-sm text-coffee-900">
          Show on bulletin board
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-coffee-800 text-white py-3 hover:bg-coffee-900 transition-colors disabled:opacity-50 uppercase text-sm tracking-wide"
      >
        {loading ? "Adding Location..." : "Add Location"}
      </button>
    </form>
  );
}
