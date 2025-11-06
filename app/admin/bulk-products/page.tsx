"use client";

import { useState } from "react";
import Link from "next/link";

export default function BulkProductsPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/products/export");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to export products");
    }
  };

  const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-coffee-600 hover:text-coffee-700 mb-4 inline-block"
        >
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Bulk Product Management</h1>
        <p className="text-gray-600">
          Import and export products using CSV files
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
            Export Products
          </h2>
          <p className="text-gray-600 mb-6">
            Download all products as a CSV file. You can edit the file in Excel
            or Google Sheets and re-import it.
          </p>
          <button
            onClick={handleExport}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Download CSV
          </button>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">CSV Format:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Includes all product fields</li>
              <li>• ID column for updating existing products</li>
              <li>• Empty ID creates new product</li>
              <li>• Use quotes for text with commas</li>
            </ul>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Import Products
          </h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file to create or update multiple products at once.
          </p>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose CSV File
              </label>
              <input
                type="file"
                name="file"
                accept=".csv"
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
            >
              {uploading ? "Uploading..." : "Upload & Import"}
            </button>
          </form>

          {/* Results */}
          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">
                Import Successful!
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Created: {result.results.created} products</li>
                <li>✓ Updated: {result.results.updated} products</li>
                {result.results.errors.length > 0 && (
                  <li className="text-red-600">
                    ⚠ Errors: {result.results.errors.length}
                  </li>
                )}
              </ul>
              {result.results.errors.length > 0 && (
                <div className="mt-3">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-red-600 font-medium">
                      Show Errors
                    </summary>
                    <ul className="mt-2 text-red-600 space-y-1">
                      {result.results.errors.map((err: string, i: number) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Tips:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Export first to get the correct format</li>
              <li>• Include ID to update existing products</li>
              <li>• Leave ID empty to create new products</li>
              <li>• Required: name, slug, description, imageUrl</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
