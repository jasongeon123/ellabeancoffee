import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';
import { redirect } from "next/navigation";
import Link from "next/link";
import ReturnManagementCard from "@/components/ReturnManagementCard";

export default async function AdminReturnsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Get all return requests
    const result = await pool.query(
      `SELECT
        r.*,
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as user
      FROM "Return" r
      LEFT JOIN "User" u ON r."userId" = u.id
      ORDER BY r."createdAt" DESC`
    );

    await pool.end();

    const returns = result.rows;

    const pendingReturns = returns.filter((r: any) => r.status === "pending");
    const approvedReturns = returns.filter((r: any) => r.status === "approved");
    const completedReturns = returns.filter((r: any) => r.status === "completed");
    const rejectedReturns = returns.filter((r: any) => r.status === "rejected");

    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-coffee-600 hover:text-coffee-900 mb-4 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin Dashboard
            </Link>
            <h1 className="text-4xl sm:text-5xl font-light text-coffee-900 mb-3 tracking-tight">
              Returns Management
            </h1>
            <p className="text-coffee-600 text-lg font-light">
              Manage customer return requests
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 border border-coffee-200">
              <p className="text-coffee-600 text-sm font-light mb-1">Pending</p>
              <p className="text-3xl font-light text-yellow-600">{pendingReturns.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-coffee-200">
              <p className="text-coffee-600 text-sm font-light mb-1">Approved</p>
              <p className="text-3xl font-light text-blue-600">{approvedReturns.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-coffee-200">
              <p className="text-coffee-600 text-sm font-light mb-1">Completed</p>
              <p className="text-3xl font-light text-green-600">{completedReturns.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-coffee-200">
              <p className="text-coffee-600 text-sm font-light mb-1">Rejected</p>
              <p className="text-3xl font-light text-red-600">{rejectedReturns.length}</p>
            </div>
          </div>

          {/* Return Requests */}
          {returns.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-coffee-200">
              <div className="inline-block p-6 bg-coffee-50 rounded-full mb-4">
                <svg className="w-12 h-12 text-coffee-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-coffee-900 mb-2">No return requests</h3>
              <p className="text-coffee-600 font-light">
                All caught up! No pending return requests at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((returnRequest: any) => (
                <ReturnManagementCard key={returnRequest.id} returnRequest={returnRequest} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch returns:", error);
    await pool.end();
    throw error;
  }
}
