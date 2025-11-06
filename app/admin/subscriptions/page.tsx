"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface SubscriptionSettings {
  id: string;
  subscriptionsEnabled: boolean;
  weeklyEnabled: boolean;
  weeklyDiscount: number;
  biweeklyEnabled: boolean;
  biweeklyDiscount: number;
  monthlyEnabled: boolean;
  monthlyDiscount: number;
}

export default function SubscriptionSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SubscriptionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (session?.user && (session.user as any).role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/subscription-settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/subscription-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-coffee-600">Loading...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-coffee-900 mb-2">
            Subscription Settings
          </h1>
          <p className="text-coffee-600">
            Control which subscription frequencies are available and their discount rates
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("success")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
          {/* Master Switch */}
          <div className="pb-6 border-b border-gray-200">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium text-coffee-900 mb-1">
                  Enable Subscriptions
                </div>
                <div className="text-sm text-coffee-600">
                  Master switch to enable/disable all subscription features
                </div>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={settings.subscriptionsEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      subscriptionsEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-coffee-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </div>
            </label>
          </div>

          {/* Weekly Subscription */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-coffee-900">
                Weekly Subscription
              </h3>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={settings.weeklyEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weeklyEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-coffee-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                Discount Percentage
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={settings.weeklyDiscount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weeklyDiscount: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={!settings.weeklyEnabled}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <span className="text-coffee-700">%</span>
              </div>
            </div>
          </div>

          {/* Bi-weekly Subscription */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-coffee-900">
                Bi-Weekly Subscription
              </h3>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={settings.biweeklyEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      biweeklyEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-coffee-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                Discount Percentage
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={settings.biweeklyDiscount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      biweeklyDiscount: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={!settings.biweeklyEnabled}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <span className="text-coffee-700">%</span>
              </div>
            </div>
          </div>

          {/* Monthly Subscription */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-coffee-900">
                Monthly Subscription
              </h3>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={settings.monthlyEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      monthlyEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-coffee-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                Discount Percentage
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={settings.monthlyDiscount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      monthlyDiscount: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={!settings.monthlyEnabled}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <span className="text-coffee-700">%</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200 flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-coffee-900 text-white rounded-lg hover:bg-coffee-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="px-6 py-3 border border-gray-300 text-coffee-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
