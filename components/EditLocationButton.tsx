"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Location {
  id: string;
  title: string;
  description: string;
  address: string;
  date: Date;
  active: boolean;
}

export default function EditLocationButton({ location }: { location: Location }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    title: location.title,
    description: location.description,
    address: location.address,
    date: formatDateForInput(location.date),
    active: location.active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/locations/${location.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update location:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-coffee-700 hover:text-coffee-900 text-sm px-3 py-1 border border-coffee-300 hover:bg-coffee-50"
      >
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-coffee-900">
                Edit Location
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-coffee-600 hover:text-coffee-900 text-2xl"
              >
                ×
              </button>
            </div>

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
                  id="active-edit"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="mr-2"
                />
                <label htmlFor="active-edit" className="text-sm text-coffee-900">
                  Show on bulletin board
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-coffee-800 text-white py-3 hover:bg-coffee-900 transition-colors disabled:opacity-50 uppercase text-sm tracking-wide"
                >
                  {loading ? "Updating..." : "Update Location"}
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
