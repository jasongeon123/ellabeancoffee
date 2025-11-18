import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import ChangeUserRoleButton from "@/components/ChangeUserRoleButton";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  let users = [];

  try {
    const result = await pool.query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u."createdAt",
        COALESCE(COUNT(DISTINCT o.id), 0)::int as orders,
        COALESCE(COUNT(DISTINCT r.id), 0)::int as reviews
      FROM "User" u
      LEFT JOIN "Order" o ON o."userId" = u.id
      LEFT JOIN "Review" r ON r."userId" = u.id
      GROUP BY u.id, u.email, u.name, u.role, u."createdAt"
      ORDER BY u."createdAt" DESC`
    );

    users = result.rows.map(row => ({
      ...row,
      _count: {
        orders: row.orders,
        reviews: row.reviews,
      },
    }));
  } finally {
    await pool.end();
  }

  return (
    <div className="min-h-screen bg-coffee-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-light text-coffee-900 mb-8 tracking-tight">
          User Management
        </h1>

        <div className="bg-white border border-coffee-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-coffee-100 border-b border-coffee-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-coffee-900 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-coffee-900 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-coffee-900 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-coffee-900 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-coffee-900 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-coffee-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-coffee-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-coffee-900">
                        {user.name || "No name"}
                      </div>
                      <div className="text-sm text-coffee-600">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "Customer"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-coffee-600">
                    {user._count.orders}
                  </td>
                  <td className="px-6 py-4 text-sm text-coffee-600">
                    {user._count.reviews}
                  </td>
                  <td className="px-6 py-4 text-sm text-coffee-600">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChangeUserRoleButton
                      userId={user.id}
                      currentRole={user.role}
                    />
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
