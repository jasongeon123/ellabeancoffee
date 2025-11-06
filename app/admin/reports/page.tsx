"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface SalesData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalItems: number;
    avgOrderValue: number;
    period: string;
  };
  salesByDate: Array<{
    date: string;
    revenue: number;
    orders: number;
    items: number;
    avgOrderValue: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  statusBreakdown: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  topCustomers: Array<{
    userId: string;
    email: string;
    name: string | null;
    totalSpent: number;
    orderCount: number;
    avgOrderValue: number;
    firstOrder: string;
    lastOrder: string;
  }>;
}

export default function SalesReportsPage() {
  const [period, setPeriod] = useState("30");
  const [groupBy, setGroupBy] = useState("day");
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/reports/sales?period=${period}&groupBy=${groupBy}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  }, [period, groupBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Loading sales reports...</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.salesByDate.map((d) => d.revenue));

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sales Reports</h1>
            <p className="text-gray-600">
              Detailed sales analytics and insights
            </p>
          </div>
          <div className="flex gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-green-600">
            ${data.summary.totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Total Orders</div>
          <div className="text-3xl font-bold text-blue-600">
            {data.summary.totalOrders}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Items Sold</div>
          <div className="text-3xl font-bold text-purple-600">
            {data.summary.totalItems}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Avg Order Value</div>
          <div className="text-3xl font-bold text-orange-600">
            ${data.summary.avgOrderValue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Revenue Over Time</h2>
        <div className="space-y-2">
          {data.salesByDate.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-600">{item.date}</div>
              <div className="flex-1 flex items-center gap-2">
                <div
                  className="bg-green-500 h-8 rounded transition-all"
                  style={{
                    width: `${(item.revenue / maxRevenue) * 100}%`,
                    minWidth: "2px",
                  }}
                />
                <div className="text-sm font-medium whitespace-nowrap">
                  ${item.revenue.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  ({item.orders} orders)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center justify-between border-b pb-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-coffee-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.quantity} units sold
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    ${product.revenue.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Order Status Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(data.statusBreakdown).map(([status, count]) => {
              const colors: { [key: string]: string } = {
                pending: "bg-yellow-500",
                processing: "bg-blue-500",
                shipped: "bg-purple-500",
                delivered: "bg-green-500",
                cancelled: "bg-red-500",
              };

              const percentage =
                data.summary.totalOrders > 0
                  ? (count / data.summary.totalOrders) * 100
                  : 0;

              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="capitalize font-medium">{status}</div>
                    <div className="text-sm text-gray-600">
                      {count} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${colors[status]} h-3 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Customers by Lifetime Value */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">
          Top Customers by Lifetime Value (All Time)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Avg Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  First Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Order
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topCustomers.map((customer, index) => (
                <tr key={customer.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-8 h-8 bg-coffee-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {customer.name || "Guest"}
                    </div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-green-600">
                      ${customer.totalSpent.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {customer.orderCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    ${customer.avgOrderValue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.firstOrder).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.lastOrder).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
